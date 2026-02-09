import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";

export const runtime = "edge";

export async function GET() {
  try {
    const prompt = `
    Create a list of three open-ended and engaging questions formatted as a single string.
    Each question should be separated by '||'.

    These questions are for an anonymous social messaging platform like Qooh.me.
    Avoid personal or sensitive topics.
    Focus on universal themes that encourage friendly interaction.

    Example output:
    "What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?"
    `;

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxOutputTokens: 400
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("An unexpected error occurred!", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
