import Anthropic from "@anthropic-ai/sdk";

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 529];

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY no configurada");
  return new Anthropic({ apiKey });
}

export async function callClaude(
  params: Anthropic.MessageCreateParamsNonStreaming,
  retries = 3
): Promise<string> {
  const client = getClient();
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await client.messages.create(params);
      const block = response.content[0];
      return block.type === "text" ? block.text : "";
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      const isRetryable = status ? RETRYABLE_STATUS_CODES.includes(status) : true;
      const isLastAttempt = attempt === retries - 1;

      if (isLastAttempt || !isRetryable) {
        console.error(`[Claude] Failed after ${attempt + 1} attempts:`, error);
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`[Claude] Attempt ${attempt + 1} failed (status: ${status}), retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("[Claude] Unexpected: exhausted retries");
}
