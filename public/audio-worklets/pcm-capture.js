class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleStep = sampleRate / 16000;
    this.nextInputPosition = 0;
    this.totalInputSamples = 0;
    this.previousSample = 0;
    this.outputSamples = [];
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    if (output) output.fill(0);
    if (!input?.length) return true;

    const blockStart = this.totalInputSamples;
    const blockEnd = blockStart + input.length;
    while (this.nextInputPosition < blockEnd - 1) {
      const lower = Math.floor(this.nextInputPosition);
      const fraction = this.nextInputPosition - lower;
      const lowerSample =
        lower < blockStart ? this.previousSample : input[lower - blockStart];
      const upperSample = input[lower + 1 - blockStart];
      const sample = lowerSample + (upperSample - lowerSample) * fraction;
      const clamped = Math.max(-1, Math.min(1, sample));
      this.outputSamples.push(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff);
      this.nextInputPosition += this.sampleStep;

      if (this.outputSamples.length === 1600) {
        const pcm = new ArrayBuffer(this.outputSamples.length * 2);
        const view = new DataView(pcm);
        for (let index = 0; index < this.outputSamples.length; index += 1) {
          view.setInt16(index * 2, this.outputSamples[index], true);
        }
        this.port.postMessage(pcm, [pcm]);
        this.outputSamples = [];
      }
    }

    this.previousSample = input[input.length - 1];
    this.totalInputSamples = blockEnd;
    return true;
  }
}

registerProcessor("pcm-capture-16khz", PcmCaptureProcessor);
