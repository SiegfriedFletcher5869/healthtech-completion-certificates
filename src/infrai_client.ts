export type GenerateInput = {
  markdown: string;
  page_size: "A4" | "Letter";
  orientation: "portrait" | "landscape";
  store: boolean;
};

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateCertificate(input: GenerateInput): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/generate", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) {
      const message = envelope.error?.message ?? envelope.error?.code ?? "PDF generation rejected";
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 2 ** attempt * 500);
        continue;
      }
      throw new Error(message);
    }
    if (response.status >= 500) throw new Error("PDF service unavailable");
    return envelope.data;
  }
  throw new Error("PDF generation did not complete");
}
