/**
 * Service for interacting with Together AI to provide Islamic advisory.
 */

const TOGETHER_API_KEY = process.env.EXPO_PUBLIC_TOGETHER_API_KEY;
const TOGETHER_MODEL =
  process.env.EXPO_PUBLIC_TOGETHER_MODEL ||
  "meta-llama/Llama-3.3-70B-Instruct-Turbo";
const API_URL = "https://api.together.xyz/v1/chat/completions";

const SYSTEM_PROMPT = `
Anda adalah "Islamic AI", asisten virtual cerdas yang ahli dalam bidang keislaman, Al-Quran, Hadits, dan hukum Fiqih.
Tujuan Anda adalah membantu pengguna mendapatkan informasi yang akurat, santun, dan sesuai dengan manhaj Ahlussunnah wal Jama'ah.

Pedoman Jawaban:
1. Awali dengan salam yang islami jika menyapa.
2. Berikan jawaban yang berasaskan Al-Quran dan Hadits. Jika memungkinkan, sertakan kutipan ayat atau riwayat hadits yang relevan.
3. Gunakan bahasa Indonesia yang baik, sopan, dan mudah dipahami.
4. Jika pertanyaan tidak berkaitan dengan Islam, tetap jawab dengan sopan namun arahkan kembali ke konteks keislaman jika memungkinkan.
5. Jika Anda tidak yakin atau suatu masalah memerlukan fatwa khusus dari ulama kontemporer secara langsung, sarankan pengguna untuk berkonsultasi dengan ustadz atau ahli agama setempat.
6. Jaga jawaban agar tetap objektif dan moderat (wasathiyah).
`;

export async function generateIslamicResponse(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  if (!TOGETHER_API_KEY) {
    throw new Error(
      "Together AI API Key is missing. Please check your .env file."
    );
  }

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Gagal mendapatkan respon dari AI."
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
