// Синхронизация: хранит один JSON-снимок на ключ пользователя в Upstash Redis (Vercel KV).
// Переменные окружения: KV_REST_API_URL, KV_REST_API_TOKEN (создаются при подключении Upstash/Vercel KV).
import { createHash } from 'node:crypto';

const MAX = 900_000; // ~0.9 МБ, лимит Upstash на запрос — 1 МБ

async function redis(cmd) {
  const r = await fetch(process.env.KV_REST_API_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error(d.error || 'storage_error');
  return d.result;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sync-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return res.status(500).json({ error: 'Хранилище не настроено (KV_REST_API_URL / KV_REST_API_TOKEN)' });
  let secret = '';
  try { secret = decodeURIComponent(String(req.headers['x-sync-key'] || '')); } catch (e) { secret = ''; }
  if (secret.length < 12) return res.status(401).json({ error: 'Ключ слишком короткий' });
  const key = 'myday:' + createHash('sha256').update(secret).digest('hex');
  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', key]);
      if (!raw) return res.status(200).json({ data: null, updated: 0 });
      const o = JSON.parse(raw);
      return res.status(200).json({ data: o.data, updated: o.updated });
    }
    if (req.method === 'PUT') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      if (typeof b.data !== 'string' || !(b.updated > 0)) return res.status(400).json({ error: 'Некорректные данные' });
      if (b.data.length > MAX) return res.status(413).json({ error: 'Данные слишком большие для синхронизации' });
      JSON.parse(b.data);
      await redis(['SET', key, JSON.stringify({ data: b.data, updated: b.updated })]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Метод не поддерживается' });
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
