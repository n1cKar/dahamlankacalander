import { createServerFn } from "@tanstack/react-start";

/**
 * Translate English text to Sinhala via the Lovable AI Gateway.
 * Keeps **highlight** and *italic* markers intact so the UI styling survives.
 */
export const translateToSinhala = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    if (!input || typeof input.text !== "string") {
      throw new Error("text is required");
    }
    if (input.text.length > 5000) throw new Error("text too long");
    return input;
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a translator. Translate the user's English text into Sinhala (Sri Lankan). " +
              "Preserve all Markdown-style formatting exactly: keep **bold** as **bold**, *italic* as *italic*, " +
              "line breaks, bullet points and numbers unchanged. " +
              "Translate place names, job titles and quantities naturally. " +
              "Return ONLY the translated text, no explanations, no quotes.",
          },
          { role: "user", content: data.text },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up in workspace settings.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Translate failed: ${res.status} ${t.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const out = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { sinhala: out };
  });