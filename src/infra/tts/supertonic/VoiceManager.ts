/**
 * VoiceManager - Manages voice embedding downloads and caching for Supertonic TTS
 * Downloads speaker embeddings from HuggingFace CDN and caches them in memory
 */
export default class VoiceManager {
  #cache: Map<string, Float32Array> = new Map();
  #baseUrl =
    "https://huggingface.co/onnx-community/Supertonic-TTS-ONNX/resolve/main/voices/";

  /**
   * Get list of available voices
   * @returns Promise resolving to array of voice IDs
   */
  async getVoiceList(): Promise<string[]> {
    return ["F1", "F2", "F3", "F4", "F5", "M1", "M2", "M3", "M4", "M5"];
  }

  /**
   * Load voice embedding from HuggingFace CDN
   * Caches loaded voices in memory for subsequent requests
   * @param voiceId - Voice identifier (e.g., "F1", "M3")
   * @returns Promise resolving to Float32Array containing voice embedding
   * @throws Error if download fails or voice not found
   */
  async loadVoice(voiceId: string): Promise<Float32Array> {
    // Return cached voice if available
    if (this.#cache.has(voiceId)) {
      return this.#cache.get(voiceId)!;
    }

    // Download voice embedding from HuggingFace
    const url = `${this.#baseUrl}${voiceId}.bin`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to download voice ${voiceId}: ${response.status} ${response.statusText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const embedding = new Float32Array(arrayBuffer);

      // Cache the loaded embedding
      this.#cache.set(voiceId, embedding);

      return embedding;
    } catch (error) {
      throw new Error(
        `Failed to load voice ${voiceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
