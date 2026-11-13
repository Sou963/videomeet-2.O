"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const configuredMaxFileSizeMb = Number(process.env.NEXT_PUBLIC_MEETING_MAX_FILE_SIZE_MB);
export const MAX_MEETING_FILE_SIZE_MB =
  Number.isSafeInteger(configuredMaxFileSizeMb) &&
  configuredMaxFileSizeMb > 0 &&
  configuredMaxFileSizeMb <= Number.MAX_SAFE_INTEGER / (1024 * 1024)
    ? configuredMaxFileSizeMb
    : 25;
const MAX_FILE_SIZE = MAX_MEETING_FILE_SIZE_MB * 1024 * 1024;
const CHUNK_SIZE = 32 * 1024;
const BUFFER_HIGH_WATER = 512 * 1024;
const BUFFER_LOW_WATER = 256 * 1024;
const MAX_ACTIVE_RECEIVES = 3;
const STORAGE_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const COMPLETED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MIME_TYPE_PATTERN = /^[\w!#$&^_.+-]+\/[\w!#$&^_.+-]+$/;
const ACTIVE_STATUSES = new Set([
  "authorizing",
  "waiting",
  "sending",
  "receiving",
  "verifying",
]);

const storageKey = (meetingId) => `videomeet_file_sharing_${meetingId}`;
const getSafeFileName = (name) =>
  String(name || "shared-file")
    .replace(/[\\/\u0000-\u001f\u007f]/g, "_")
    .trim()
    .slice(-255) || "shared-file";
const getMimeType = (type) =>
  MIME_TYPE_PATTERN.test(type || "") && type.length <= 127
    ? type
    : "application/octet-stream";

function isValidIncomingMetadata(metadata, meetingId) {
  return (
    metadata &&
    typeof metadata.transferId === "string" &&
    metadata.transferId.length <= 64 &&
    metadata.meetingId === meetingId &&
    typeof metadata.fileName === "string" &&
    metadata.fileName.length > 0 &&
    metadata.fileName.length <= 255 &&
    !/[\\/\u0000-\u001f\u007f]/.test(metadata.fileName) &&
    Number.isSafeInteger(metadata.fileSize) &&
    metadata.fileSize > 0 &&
    metadata.fileSize <= MAX_FILE_SIZE &&
    getMimeType(metadata.mimeType) === metadata.mimeType &&
    Number.isSafeInteger(metadata.totalChunks) &&
    metadata.totalChunks === Math.ceil(metadata.fileSize / CHUNK_SIZE) &&
    typeof metadata.senderId === "string" &&
    typeof metadata.receiverId === "string"
  );
}

export default function useMeetingFiles({
  meetingId,
  name,
  onNotify,
}) {
  const [transfers, setTransfers] = useState([]);
  const [notification, setNotification] = useState(null);
  const recordsRef = useRef(new Map());
  const peerConnectionsRef = useRef(null);
  const socketRef = useRef(null);
  const channelsRef = useRef(new Map());
  const incomingOffersRef = useRef(new Map());
  const incomingTransfersRef = useRef(new Map());
  const pendingBinaryRef = useRef(new WeakMap());
  const outgoingFilesRef = useRef(new Map());
  const outgoingCancelsRef = useRef(new Map());
  const downloadBlobsRef = useRef(new Map());
  const socketBindingRef = useRef(null);
  const mountedRef = useRef(true);
  const meetingIdRef = useRef(meetingId);
  const localNameRef = useRef(name);
  const onNotifyRef = useRef(onNotify);

  useEffect(() => {
    meetingIdRef.current = meetingId;
    localNameRef.current = name;
    onNotifyRef.current = onNotify;
  }, [meetingId, name, onNotify]);

  const setPeerConnections = useCallback((ref) => {
    peerConnectionsRef.current = ref;
  }, []);

  const persistRecords = useCallback((records) => {
    try {
      const currentTime = Date.now();
      const metadata = [...records.values()]
        .filter((record) => {
          const age = currentTime - new Date(record.timestamp).getTime();
          const retention = record.transferStatus === "completed"
            ? COMPLETED_RETENTION_MS
            : STORAGE_RETENTION_MS;
          return Number.isFinite(age) && age <= retention;
        })
        .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
        .slice(0, 100)
        .map((record) => ({
          transferId: record.transferId,
          fileName: record.fileName,
          fileSize: record.fileSize,
          mimeType: record.mimeType,
          senderName: record.senderName,
          senderId: record.senderId,
          timestamp: record.timestamp,
          transferStatus: record.transferStatus,
          direction: record.direction,
          receiver: record.receiver,
          error: record.error || null,
        }));
      localStorage.setItem(storageKey(meetingIdRef.current), JSON.stringify(metadata));
    } catch (error) {
      console.warn("[Files] Could not save local file-sharing history:", error.message);
    }
  }, []);

  const publishRecords = useCallback(() => {
    if (!mountedRef.current) return;
    const now = Date.now();
    const kept = [...recordsRef.current.entries()]
      .filter(([, record]) => {
        const age = now - new Date(record.timestamp).getTime();
        const retention = record.transferStatus === "completed"
          ? COMPLETED_RETENTION_MS
          : STORAGE_RETENTION_MS;
        return Number.isFinite(age) && (ACTIVE_STATUSES.has(record.transferStatus) || age <= retention);
      })
      .sort(([, left], [, right]) => new Date(right.timestamp) - new Date(left.timestamp));
    const active = kept.filter(([, record]) => ACTIVE_STATUSES.has(record.transferStatus));
    const history = kept.filter(([, record]) => !ACTIVE_STATUSES.has(record.transferStatus));
    recordsRef.current = new Map([...active, ...history.slice(0, Math.max(0, 100 - active.length))]);
    setTransfers(
      [...recordsRef.current.values()].sort(
        (left, right) => new Date(right.timestamp) - new Date(left.timestamp)
      )
    );
    persistRecords(recordsRef.current);
  }, [persistRecords]);

  const updateTransfer = useCallback(
    (transferId, patch) => {
      const current = recordsRef.current.get(transferId);
      if (!current) return;
      recordsRef.current.set(transferId, { ...current, ...patch });
      publishRecords();
    },
    [publishRecords]
  );

  const addTransfer = useCallback(
    (record) => {
      recordsRef.current.set(record.transferId, record);
      publishRecords();
    },
    [publishRecords]
  );

  const notify = useCallback((message, type = "info") => {
    const notice = { message, type, id: uuidv4() };
    setNotification(notice);
    onNotifyRef.current?.(notice);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    try {
      const stored = JSON.parse(
        localStorage.getItem(storageKey(meetingIdRef.current)) || "[]"
      );
      if (Array.isArray(stored)) {
        const valid = stored
          .filter(
            (record) =>
              record &&
              typeof record.transferId === "string" &&
              typeof record.fileName === "string" &&
              Number.isSafeInteger(record.fileSize) &&
              record.fileSize >= 0 &&
              typeof record.timestamp === "string" &&
              Date.now() - new Date(record.timestamp).getTime() <=
                (record.transferStatus === "completed"
                  ? COMPLETED_RETENTION_MS
                  : STORAGE_RETENTION_MS)
          )
          .slice(0, 100)
          .map((record) => ({
            ...record,
            transferStatus: ACTIVE_STATUSES.has(record.transferStatus)
              ? "interrupted"
              : record.transferStatus,
            progress: record.transferStatus === "completed" ? 100 : 0,
          }));
        recordsRef.current = new Map(
          valid.map((record) => [record.transferId, record])
        );
        publishRecords();
      }
    } catch (error) {
      console.warn("[Files] Could not restore local file-sharing history:", error.message);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [meetingId, publishRecords]);

  const markFailed = useCallback(
    (transferId, message) => {
      updateTransfer(transferId, {
        transferStatus: "failed",
        error: message,
      });
      incomingTransfersRef.current.delete(transferId);
      incomingOffersRef.current.delete(transferId);
      outgoingFilesRef.current.delete(transferId);
      outgoingCancelsRef.current.delete(transferId);
      notify(message || "File transfer failed.", "error");
    },
    [notify, updateTransfer]
  );

  const cancelTransfer = useCallback(
    (transferId) => {
      const record = recordsRef.current.get(transferId);
      if (!record || !ACTIVE_STATUSES.has(record.transferStatus)) return;

      outgoingCancelsRef.current.set(transferId, true);
      const peerId = record.direction === "sent" ? record.receiver?.id : record.senderId;
      const channel = channelsRef.current.get(peerId);
      if (channel?.readyState === "open") {
        channel.send(JSON.stringify({ type: "cancel", transferId }));
      }
      if (socketRef.current?.connected) {
        socketRef.current.emit("file-transfer-cancel", {
          meetingId: meetingIdRef.current,
          transferId,
        });
      }
      incomingTransfersRef.current.delete(transferId);
      incomingOffersRef.current.delete(transferId);
      outgoingFilesRef.current.delete(transferId);
      updateTransfer(transferId, { transferStatus: "cancelled", error: null });
      notify(`Cancelled ${record.fileName}.`, "info");
    },
    [notify, updateTransfer]
  );

  const sendControl = useCallback((channel, message) => {
    if (channel.readyState === "open") channel.send(JSON.stringify(message));
  }, []);

  const announceIncomingReady = useCallback(
    (channel, peerId) => {
      if (channel.readyState !== "open" || !socketRef.current?.connected) return;
      for (const [transferId, offer] of incomingOffersRef.current) {
        if (offer.senderId !== peerId || offer.ready) continue;
        incomingOffersRef.current.set(transferId, { ...offer, ready: true });
        socketRef.current.emit("file-transfer-ready", {
          meetingId: meetingIdRef.current,
          transferId,
        });
        updateTransfer(transferId, { transferStatus: "waiting" });
      }
    },
    [updateTransfer]
  );

  const handleDataChannel = useCallback(
    (channel, peerId) => {
      const previousChannel = channelsRef.current.get(peerId);
      if (previousChannel && previousChannel !== channel) {
        previousChannel.onopen = null;
        previousChannel.onmessage = null;
        previousChannel.onclose = null;
        previousChannel.onerror = null;
      }
      channel.binaryType = "arraybuffer";
      channel.bufferedAmountLowThreshold = BUFFER_LOW_WATER;
      channelsRef.current.set(peerId, channel);

      channel.onopen = () => announceIncomingReady(channel, peerId);
      channel.onmessage = (event) => {
        if (typeof event.data !== "string") {
          const header = pendingBinaryRef.current.get(channel);
          pendingBinaryRef.current.delete(channel);
          const transfer = header
            ? incomingTransfersRef.current.get(header.transferId)
            : null;
          if (
            !header ||
            !transfer ||
            transfer.channel !== channel ||
            !(event.data instanceof ArrayBuffer) ||
            header.chunkIndex !== transfer.receivedChunks ||
            header.byteLength !== event.data.byteLength
          ) {
            if (header) {
              sendControl(channel, {
                type: "cancel",
                transferId: header.transferId,
              });
              socketRef.current?.emit("file-transfer-cancel", {
                meetingId: meetingIdRef.current,
                transferId: header.transferId,
              });
              markFailed(header.transferId, "Received an invalid file chunk.");
            }
            return;
          }

          const expectedLength = Math.min(
            CHUNK_SIZE,
            transfer.metadata.fileSize - transfer.receivedBytes
          );
          if (event.data.byteLength !== expectedLength) {
            socketRef.current?.emit("file-transfer-cancel", {
              meetingId: meetingIdRef.current,
              transferId: header.transferId,
            });
            markFailed(header.transferId, "The file chunk size did not match.");
            return;
          }
          transfer.chunks.push(event.data);
          transfer.receivedBytes += event.data.byteLength;
          transfer.receivedChunks += 1;
          const progress = Math.floor(
            (transfer.receivedBytes / transfer.metadata.fileSize) * 100
          );
          updateTransfer(header.transferId, {
            transferStatus: "receiving",
            progress,
            bytesTransferred: transfer.receivedBytes,
          });
          return;
        }

        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          notify("A malformed file-transfer message was rejected.", "error");
          return;
        }

        if (!message || typeof message.type !== "string") return;
        if (message.type === "chunk") {
          const transfer = incomingTransfersRef.current.get(message.transferId);
          if (
            !transfer ||
            transfer.channel !== channel ||
            pendingBinaryRef.current.has(channel) ||
            !Number.isSafeInteger(message.chunkIndex) ||
            !Number.isSafeInteger(message.byteLength) ||
            message.byteLength < 1 ||
            message.byteLength > CHUNK_SIZE
          ) {
            markFailed(message.transferId, "An unexpected file chunk was rejected.");
            return;
          }
          pendingBinaryRef.current.set(channel, message);
          return;
        }

        if (message.type === "start") {
          const offer = incomingOffersRef.current.get(message.transferId);
          const activeReceives = [...recordsRef.current.values()].filter(
            (record) =>
              record.direction === "received" &&
              ACTIVE_STATUSES.has(record.transferStatus)
          ).length;
          if (
            !isValidIncomingMetadata(message, meetingIdRef.current) ||
            !offer ||
            offer.senderId !== peerId ||
            offer.receiverId !== socketRef.current?.id ||
            message.senderId !== peerId ||
            message.receiverId !== socketRef.current?.id ||
            message.fileName !== offer.fileName ||
            message.fileSize !== offer.fileSize ||
            message.mimeType !== offer.mimeType ||
            message.totalChunks !== offer.totalChunks ||
            incomingTransfersRef.current.has(message.transferId) ||
            activeReceives >= MAX_ACTIVE_RECEIVES
          ) {
            sendControl(channel, {
              type: "cancel",
              transferId: message.transferId,
            });
            socketRef.current?.emit("file-transfer-cancel", {
              meetingId: meetingIdRef.current,
              transferId: message.transferId,
            });
            markFailed(message.transferId, "This file transfer was not authorized.");
            return;
          }

          const incoming = {
            metadata: message,
            channel,
            chunks: [],
            receivedBytes: 0,
            receivedChunks: 0,
          };
          incomingTransfersRef.current.set(message.transferId, incoming);
          incomingOffersRef.current.delete(message.transferId);
          updateTransfer(message.transferId, {
            transferStatus: "receiving",
            progress: 0,
            senderName: offer.senderName,
            senderId: peerId,
            timestamp: offer.timestamp,
          });
          return;
        }

        if (message.type === "complete") {
          const incoming = incomingTransfersRef.current.get(message.transferId);
          if (
            !incoming ||
            incoming.channel !== channel ||
            incoming.receivedBytes !== incoming.metadata.fileSize ||
            incoming.receivedChunks !== incoming.metadata.totalChunks ||
            incoming.chunks.length !== incoming.metadata.totalChunks
          ) {
            socketRef.current?.emit("file-transfer-cancel", {
              meetingId: meetingIdRef.current,
              transferId: message.transferId,
            });
            markFailed(message.transferId, "The received file was incomplete.");
            return;
          }

          const blob = new Blob(incoming.chunks, {
            type: incoming.metadata.mimeType,
          });
          if (blob.size !== incoming.metadata.fileSize) {
            socketRef.current?.emit("file-transfer-cancel", {
              meetingId: meetingIdRef.current,
              transferId: message.transferId,
            });
            markFailed(message.transferId, "The received file failed its size check.");
            return;
          }
          downloadBlobsRef.current.set(message.transferId, blob);
          incomingTransfersRef.current.delete(message.transferId);
          updateTransfer(message.transferId, {
            transferStatus: "completed",
            progress: 100,
            bytesTransferred: blob.size,
            error: null,
          });
          sendControl(channel, {
            type: "complete-ack",
            transferId: message.transferId,
          });
          socketRef.current?.emit("file-transfer-finished", {
            meetingId: meetingIdRef.current,
            transferId: message.transferId,
          });
          notify(`Received ${incoming.metadata.fileName}.`, "success");
          return;
        }

        if (message.type === "complete-ack") {
          const record = recordsRef.current.get(message.transferId);
          if (
            record?.direction !== "sent" ||
            record.receiver?.id !== peerId ||
            !outgoingFilesRef.current.has(message.transferId)
          ) {
            return;
          }
          updateTransfer(message.transferId, {
            transferStatus: "completed",
            progress: 100,
            bytesTransferred: record.fileSize,
            error: null,
          });
          outgoingFilesRef.current.delete(message.transferId);
          outgoingCancelsRef.current.delete(message.transferId);
          notify(`Sent ${record.fileName} to ${record.receiver.name}.`, "success");
          return;
        }

        if (message.type === "cancel") {
          const record = recordsRef.current.get(message.transferId);
          if (record && ACTIVE_STATUSES.has(record.transferStatus)) {
            socketRef.current?.emit("file-transfer-cancel", {
              meetingId: meetingIdRef.current,
              transferId: message.transferId,
            });
            outgoingCancelsRef.current.set(message.transferId, true);
            incomingTransfersRef.current.delete(message.transferId);
            incomingOffersRef.current.delete(message.transferId);
            outgoingFilesRef.current.delete(message.transferId);
            updateTransfer(message.transferId, {
              transferStatus: "cancelled",
              error: null,
            });
            notify(`${record.fileName} transfer was cancelled.`, "info");
          }
        }
      };

      channel.onclose = () => {
        if (channelsRef.current.get(peerId) === channel) {
          channelsRef.current.delete(peerId);
        }
        for (const record of recordsRef.current.values()) {
          const associatedPeer =
            record.direction === "sent" ? record.receiver?.id : record.senderId;
          if (
            associatedPeer === peerId &&
            ACTIVE_STATUSES.has(record.transferStatus)
          ) {
            if (socketRef.current?.connected) {
              socketRef.current.emit("file-transfer-cancel", {
                meetingId: meetingIdRef.current,
                transferId: record.transferId,
              });
            }
            outgoingCancelsRef.current.set(record.transferId, true);
            incomingTransfersRef.current.delete(record.transferId);
            incomingOffersRef.current.delete(record.transferId);
            outgoingFilesRef.current.delete(record.transferId);
            updateTransfer(record.transferId, {
              transferStatus: "interrupted",
              error: "The peer connection closed.",
            });
          }
        }
      };
      channel.onerror = () => {
        for (const record of recordsRef.current.values()) {
          const associatedPeer =
            record.direction === "sent" ? record.receiver?.id : record.senderId;
          if (
            associatedPeer === peerId &&
            ACTIVE_STATUSES.has(record.transferStatus)
          ) {
            updateTransfer(record.transferId, {
              transferStatus: "interrupted",
              error: "The peer connection reported a transfer error.",
            });
          }
        }
      };
      if (channel.readyState === "open") announceIncomingReady(channel, peerId);
    },
    [announceIncomingReady, markFailed, notify, sendControl, updateTransfer]
  );

  const startOutgoingTransfer = useCallback(
    async (transferId, file, receiverId) => {
      const channel = channelsRef.current.get(receiverId);
      const record = recordsRef.current.get(transferId);
      const socket = socketRef.current;
      if (!channel || !record || !socket?.connected) {
        markFailed(transferId, "The peer connection is no longer available.");
        return;
      }

      const cancelled = () => outgoingCancelsRef.current.get(transferId) === true;
      const waitForBuffer = async () => {
        if (channel.bufferedAmount <= BUFFER_HIGH_WATER) return;
        await new Promise((resolve, reject) => {
          const onLow = () => {
            channel.removeEventListener("bufferedamountlow", onLow);
            channel.removeEventListener("close", onClosed);
            resolve();
          };
          const onClosed = () => {
            channel.removeEventListener("bufferedamountlow", onLow);
            reject(new Error("The peer connection closed."));
          };
          channel.addEventListener("bufferedamountlow", onLow, { once: true });
          channel.addEventListener("close", onClosed, { once: true });
          if (channel.readyState !== "open") onClosed();
          else if (channel.bufferedAmount <= BUFFER_LOW_WATER) onLow();
        });
      };

      try {
        if (channel.readyState !== "open") {
          await new Promise((resolve, reject) => {
            const onOpen = () => {
              channel.removeEventListener("close", onClosed);
              resolve();
            };
            const onClosed = () => {
              channel.removeEventListener("open", onOpen);
              reject(new Error("The peer connection closed."));
            };
            channel.addEventListener("open", onOpen, { once: true });
            channel.addEventListener("close", onClosed, { once: true });
            if (channel.readyState === "open") onOpen();
            else if (channel.readyState === "closed" || channel.readyState === "closing") onClosed();
          });
        }
        if (cancelled()) return;
        updateTransfer(transferId, { transferStatus: "sending", progress: 0 });
        sendControl(channel, {
          type: "start",
          transferId,
          meetingId: meetingIdRef.current,
          fileName: record.fileName,
          fileSize: file.size,
          mimeType: record.mimeType,
          totalChunks: Math.ceil(file.size / CHUNK_SIZE),
          senderId: socket.id,
          receiverId,
          senderName: localNameRef.current,
          timestamp: record.timestamp,
        });

        let sentBytes = 0;
        let lastReportedBytes = 0;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
          if (cancelled()) return;
          if (channel.readyState !== "open") {
            throw new Error("The peer connection closed during transfer.");
          }
          await waitForBuffer();
          if (cancelled()) return;

          const start = chunkIndex * CHUNK_SIZE;
          const chunk = await file.slice(start, start + CHUNK_SIZE).arrayBuffer();
          if (cancelled()) return;
          if (chunk.byteLength < 1 || chunk.byteLength > CHUNK_SIZE) {
            throw new Error("A file chunk could not be read.");
          }

          sendControl(channel, {
            type: "chunk",
            transferId,
            chunkIndex,
            byteLength: chunk.byteLength,
          });
          channel.send(chunk);
          sentBytes += chunk.byteLength;
          if (sentBytes - lastReportedBytes >= CHUNK_SIZE * 4 || chunkIndex === totalChunks - 1) {
            lastReportedBytes = sentBytes;
            updateTransfer(transferId, {
              transferStatus: "sending",
              progress: Math.floor((sentBytes / file.size) * 100),
              bytesTransferred: sentBytes,
            });
          }
        }

        if (cancelled()) return;
        await waitForBuffer();
        if (cancelled()) return;
        sendControl(channel, { type: "complete", transferId });
        updateTransfer(transferId, { transferStatus: "verifying" });
      } catch (error) {
        if (!cancelled()) {
          socket.emit("file-transfer-cancel", {
            meetingId: meetingIdRef.current,
            transferId,
          });
          markFailed(transferId, error.message || "The file could not be sent.");
        }
      }
    },
    [markFailed, sendControl, updateTransfer]
  );

  const shareFile = useCallback(
    (file, recipients) => {
      if (!(file instanceof File) || file.size < 1 || file.size > MAX_FILE_SIZE) {
        notify("Choose a file larger than 0 bytes and no larger than 25 MB.", "error");
        return;
      }
      if (!socketRef.current?.connected || !Array.isArray(recipients) || !recipients.length) {
        notify("No connected participants are available for file sharing.", "error");
        return;
      }

      const fileName = getSafeFileName(file.name);
      const mimeType = getMimeType(file.type);
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let acceptedCount = 0;

      for (const recipient of recipients) {
        const peer = peerConnectionsRef.current?.current?.[recipient.id];
        const channel = channelsRef.current.get(recipient.id);
        if (!peer || !channel || channel.readyState === "closed") continue;

        const transferId = uuidv4();
        const timestamp = new Date().toISOString();
        const record = {
          transferId,
          fileName,
          fileSize: file.size,
          mimeType,
          senderName: localNameRef.current || "You",
          senderId: socketRef.current.id,
          timestamp,
          transferStatus: "authorizing",
          direction: "sent",
          receiver: { id: recipient.id, name: recipient.name || peer.name || "Participant" },
          progress: 0,
          bytesTransferred: 0,
          error: null,
        };
        outgoingFilesRef.current.set(transferId, file);
        outgoingCancelsRef.current.set(transferId, false);
        addTransfer(record);
        socketRef.current.emit("file-transfer-request", {
          transferId,
          meetingId: meetingIdRef.current,
          receiverId: recipient.id,
          fileName,
          fileSize: file.size,
          mimeType,
          totalChunks,
        });
        acceptedCount += 1;
      }

      if (acceptedCount === 0) {
        notify("A connected file-transfer channel is not available.", "error");
      } else {
        notify(
          `Sharing ${fileName} with ${acceptedCount} participant${acceptedCount === 1 ? "" : "s"}.`,
          "success"
        );
      }
    },
    [addTransfer, notify]
  );

  const downloadTransfer = useCallback(
    (transferId) => {
      const blob = downloadBlobsRef.current.get(transferId);
      const record = recordsRef.current.get(transferId);
      if (!blob || !record) {
        notify("This local download is no longer available. Ask the sender to share it again.", "error");
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getSafeFileName(record.fileName);
      anchor.rel = "noopener";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    },
    [notify]
  );

  const canDownload = useCallback(
    (transferId) => downloadBlobsRef.current.has(transferId),
    []
  );

  const handleSocket = useCallback(
    (socket) => {
      const previous = socketBindingRef.current;
      if (previous?.socket === socket) return;
      if (previous) {
        for (const [event, listener] of previous.listeners) {
          previous.socket.off(event, listener);
        }
      }
      socketBindingRef.current = null;
      socketRef.current = null;
      if (!socket) return;

      const listeners = new Map();
      const listen = (event, listener) => {
        socket.on(event, listener);
        listeners.set(event, listener);
      };

      listen("file-transfer-authorized", ({ transferId }) => {
        if (ACTIVE_STATUSES.has(recordsRef.current.get(transferId)?.transferStatus)) {
          updateTransfer(transferId, { transferStatus: "waiting" });
        }
      });
      listen("file-transfer-ready", ({ transferId, receiverId }) => {
        const file = outgoingFilesRef.current.get(transferId);
        const record = recordsRef.current.get(transferId);
        if (!file || record?.receiver?.id !== receiverId) return;
        void startOutgoingTransfer(transferId, file, receiverId);
      });
      listen("file-transfer-offer", (offer) => {
        if (
          !isValidIncomingMetadata(offer, meetingIdRef.current) ||
          offer.receiverId !== socket.id ||
          !offer.senderName
        ) {
          socket.emit("file-transfer-cancel", {
            meetingId: meetingIdRef.current,
            transferId: offer?.transferId,
          });
          notify("An invalid file-sharing offer was rejected.", "error");
          return;
        }
        const existing = recordsRef.current.get(offer.transferId);
        if (existing) return;
        const received = {
          transferId: offer.transferId,
          fileName: offer.fileName,
          fileSize: offer.fileSize,
          mimeType: offer.mimeType,
          senderName: offer.senderName,
          senderId: offer.senderId,
          timestamp: offer.timestamp || new Date().toISOString(),
          transferStatus: "waiting",
          direction: "received",
          receiver: { id: socket.id, name: localNameRef.current || "You" },
          progress: 0,
          bytesTransferred: 0,
          error: null,
        };
        incomingOffersRef.current.set(offer.transferId, offer);
        addTransfer(received);
        notify(`${offer.senderName} is sharing ${offer.fileName}.`, "info");
        const channel = channelsRef.current.get(offer.senderId);
        if (channel) announceIncomingReady(channel, offer.senderId);
      });
      listen("file-transfer-failed", ({ transferId, message }) => {
        if (transferId) markFailed(transferId, message);
      });
      listen("file-transfer-cancelled", ({ transferId }) => {
        const record = recordsRef.current.get(transferId);
        if (!record) return;
        outgoingCancelsRef.current.set(transferId, true);
        incomingTransfersRef.current.delete(transferId);
        incomingOffersRef.current.delete(transferId);
        outgoingFilesRef.current.delete(transferId);
        updateTransfer(transferId, {
          transferStatus: "cancelled",
          error: null,
        });
      });
      listen("file-transfer-finished", ({ transferId }) => {
        const record = recordsRef.current.get(transferId);
        if (record?.direction === "sent" && record.transferStatus === "verifying") {
          updateTransfer(transferId, {
            transferStatus: "completed",
            progress: 100,
            bytesTransferred: record.fileSize,
          });
          outgoingFilesRef.current.delete(transferId);
          outgoingCancelsRef.current.delete(transferId);
        }
      });
      listen("meeting-ending", () => {
        for (const record of recordsRef.current.values()) {
          if (ACTIVE_STATUSES.has(record.transferStatus)) {
            cancelTransfer(record.transferId);
          }
        }
      });
      socketBindingRef.current = { socket, listeners };
      socketRef.current = socket;
    },
    [
      addTransfer,
      announceIncomingReady,
      cancelTransfer,
      markFailed,
      notify,
      startOutgoingTransfer,
      updateTransfer,
    ]
  );

  useEffect(
    () => () => {
      handleSocket(null);
      for (const channel of channelsRef.current.values()) {
        channel.onopen = null;
        channel.onmessage = null;
        channel.onclose = null;
        channel.onerror = null;
      }
      channelsRef.current.clear();
      downloadBlobsRef.current.clear();
    },
    [handleSocket]
  );

  return {
    transfers,
    notification,
    dismissNotification: () => setNotification(null),
    shareFile,
    cancelTransfer,
    downloadTransfer,
    canDownload,
    handleDataChannel,
    handleSocket,
    setPeerConnections,
  };
}
