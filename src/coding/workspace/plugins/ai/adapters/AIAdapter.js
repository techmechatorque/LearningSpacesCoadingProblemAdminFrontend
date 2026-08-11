/**
 * Abstract interface for AI Providers (OpenAI, Gemini, Mock, etc.)
 */
export class AIAdapter {
  /**
   * Streams a completion back to the caller.
   * @param {Array} messages Conversation history
   * @param {Object} context Current workspace context
   * @param {Array} tools Available tools
   * @param {Function} onChunk Callback fired with text chunks
   * @param {Function} onToolCall Callback fired when a tool is requested
   */
  async streamCompletion(messages, context, tools, onChunk, onToolCall) {
    throw new Error('Not implemented');
  }
}
