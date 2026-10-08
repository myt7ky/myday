export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "На сервере не задан ANTHROPIC_API_KEY", code: "missing_api_key" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return res.status(400).json({ error: "Пустой запрос" });
    if (prompt.length > 50000) return res.status(413).json({ error: "Запрос слишком большой" });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 3000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    clearTimeout(timer);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || "Claude API вернул ошибку";
      const code = response.status === 429 ? "rate_limited" : response.status === 401 ? "not_authorized" : "api_error";
      return res.status(response.status).json({ error: message, code });
    }

    const text = Array.isArray(data.content)
      ? data.content.filter(x => x && x.type === "text").map(x => x.text || "").join("\n").trim()
      : "";

    return res.status(200).json({ text });
  } catch (error) {
    const code = error?.name === "AbortError" ? "timeout" : "server_error";
    return res.status(500).json({ error: "Не удалось получить ответ Claude", code });
  }
}
