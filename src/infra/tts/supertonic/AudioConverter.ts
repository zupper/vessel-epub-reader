/**
 * AudioConverter - Converts Float32Array audio to WAV format
 *
 * Converts raw audio samples (Float32Array with values -1.0 to 1.0)
 * to WAV format (RIFF container with PCM16 audio data).
 *
 * WAV format structure:
 * - RIFF header (12 bytes)
 * - fmt chunk (24 bytes) - PCM format specification
 * - data chunk (8 bytes + audio data) - actual audio samples
 */
export default class AudioConverter {
  /**
   * Convert Float32Array audio to WAV format ArrayBuffer
   *
   * @param audio - Float32Array with samples in range [-1.0, 1.0]
   * @param sampleRate - Sample rate in Hz (typically 44100)
   * @returns ArrayBuffer containing complete WAV file data
   */
  static convertToWav(audio: Float32Array, sampleRate: number): ArrayBuffer {
    // Convert Float32 to Int16 PCM
    const pcm16 = this.#float32ToPcm16(audio);

    // Create WAV header
    const header = this.#createWavHeader(pcm16.length, sampleRate);

    // Combine header and audio data
    const wavBuffer = new ArrayBuffer(header.byteLength + pcm16.byteLength);
    const view = new Uint8Array(wavBuffer);
    view.set(new Uint8Array(header), 0);
    view.set(new Uint8Array(pcm16.buffer), header.byteLength);

    return wavBuffer;
  }

  /**
   * Convert Float32Array to Int16Array (PCM16)
   * Multiplies by 32767 and clamps to [-32768, 32767]
   */
  static #float32ToPcm16(float32: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      // Convert from [-1.0, 1.0] to [-32768, 32767]
      let sample = float32[i] * 32767;
      // Clamp to valid range
      sample = Math.max(-32768, Math.min(32767, sample));
      pcm16[i] = sample;
    }
    return pcm16;
  }

  /**
   * Create WAV file header (44 bytes)
   *
   * Structure:
   * - RIFF header (12 bytes)
   * - fmt chunk (24 bytes)
   * - data chunk header (8 bytes)
   */
  static #createWavHeader(
    pcm16Length: number,
    sampleRate: number,
  ): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const channels = 1; // Mono
    const bytesPerSample = 2; // 16-bit = 2 bytes
    const audioDataSize = pcm16Length * bytesPerSample;
    const fileSize = 36 + audioDataSize;

    // RIFF header
    this.#writeString(view, 0, "RIFF");
    view.setUint32(4, fileSize, true); // File size - 8
    this.#writeString(view, 8, "WAVE");

    // fmt chunk
    this.#writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, channels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * channels * bytesPerSample, true); // ByteRate
    view.setUint16(32, channels * bytesPerSample, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data chunk
    this.#writeString(view, 36, "data");
    view.setUint32(40, audioDataSize, true); // Subchunk2Size

    return header;
  }

  /**
   * Write ASCII string to DataView at offset
   */
  static #writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}
