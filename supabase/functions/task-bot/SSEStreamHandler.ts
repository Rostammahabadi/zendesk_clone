// SSEStreamHandler.ts
import { BaseCallbackHandler } from "npm:@langchain/core/callbacks/base";

/**
 * SSEStreamHandler streams token-by-token updates as Server-Sent Events (SSE).
 */
export class SSEStreamHandler extends BaseCallbackHandler {
  name = "SSEStreamHandler";

  private writer: WritableStreamDefaultWriter<string> | null = null;

  constructor(writer: WritableStreamDefaultWriter<string>) {
    super();
    this.writer = writer;
  }

  // Called each time a new token is generated (streaming must be set to true).
  async handleLLMNewToken(token: string) {
    if (this.writer) {
      // SSE format requires "data:" + data + "\n\n"
      await this.writer.write(`data: ${token}\n\n`);
    }
  }

  // Called once the LLM is done generating
  async handleLLMEnd() {
    if (this.writer) {
      // Send a final marker if you like, then close
      await this.writer.write(`data: [DONE]\n\n`);
      await this.writer.close();
    }
  }

  // Called if there's an error during LLM generation
  async handleLLMError(e: Error) {
    if (this.writer) {
      // You could stream out an error message, then close
      await this.writer.write(`data: [ERROR]: ${e.message}\n\n`);
      await this.writer.close();
    }
  }
}