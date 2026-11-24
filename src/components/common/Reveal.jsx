"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const supportsObserver = () =>
  typeof window !== "undefined" && "IntersectionObserver" in window;

/**
 * Reveals its children once when they scroll into view.
 * Motion is a short rise and fade; nothing loops.
 */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  children,
  ...rest
}) {
  // Server and first client render both start hidden, so the markup matches.
  // Without observers we reveal in the ref callback instead of an effect.
  const [visible, setVisible] = useState(false);
  const nodeRef = useRef(null);
  const observerRef = useRef(null);

  const attach = useCallback((node) => {
    nodeRef.current = node;
    observerRef.current?.disconnect();

    if (!node) return;

    if (!supportsObserver()) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <Tag
      ref={attach}
      data-visible={visible ? "true" : "false"}
      style={{ "--reveal-delay": `${delay}ms` }}
      className={`reveal ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
