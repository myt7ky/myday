import {createHash} from 'node:crypto';
export const CAS="local old=redis.call('GET',KEYS[1]);local rev=0;if old then rev=cjson.decode(old).revision end;if rev~=tonumber(ARGV[1]) then return 0 end;redis.call('SET',KEYS[1],ARGV[2]);return 1";
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host,allowed=(process.env.MYDAY_ALLOWED_ORIGINS||'').split(',').filter(Boolean);
 if(origin&&new URL(origin).host!==host&&!allowed.includes(origin))return res.status(403).json({error:'Адрес приложения не разрешён сервером'});
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Access-Control-Allow-Headers','Content-Type, x-notes-key');res.setHeader('Access-Control-Allow-Methods','GET, PUT, OPTIONS');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(!['GET','PUT'].includes(req.method))return res.status(405).json({error:'Метод не поддерживается'});
 const secret=String(req.headers['x-notes-key']||'');
 if(!/^[a-f0-9]{64}$/.test(secret))return res.status(401).json({error:'Нужен полный код подключения'});
 if(!process.env.KV_REST_API_URL||!process.env.KV_REST_API_TOKEN)return res.status(503).json({error:'Сервер заметок ещё не подключён к хранилищу'});
 const key='myday:notes:v1:'+createHash('sha256').update(secret).digest('hex');
 async function redis(command){const r=await fetch(process.env.KV_REST_API_URL,{method:'POST',headers:{Authorization:'Bearer '+process.env.KV_REST_API_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(12000)});const body=await r.json();if(!r.ok||body.error)throw Error('storage');return body.result}
 try{
 if(req.method==='GET'){const raw=await redis(['GET',key]);return res.status(200).json(raw?JSON.parse(raw):{revision:0,notes:[]})}
 const b=typeof req.body==='string'?JSON.parse(req.body):req.body;
 if(!b||!Number.isSafeInteger(b.revision)||b.revision<0||!Array.isArray(b.notes)||b.notes.length>2000)return res.status(400).json({error:'Некорректные данные'});
 const ids=new Set();for(const n of b.notes){if(!n||typeof n.id!=='string'||n.id.length>100||ids.has(n.id)||!Number.isFinite(n.updatedAt)||!Array.isArray(n.images)||n.images.length>3||!['idea','script','generation','editing','published','work','done'].includes(n.status))return res.status(400).json({error:'Некорректная заметка'});ids.add(n.id);if(['title','idea','prompt','voice'].some(k=>typeof n[k]!=='string'||n[k].length>(k==='title'?120:15000)))return res.status(400).json({error:'Слишком длинный текст'});if(n.images.some(i=>!i||typeof i.src!=='string'||i.src.length>350000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(i.src)))return res.status(400).json({error:'Некорректный референс'})}
 const out={revision:b.revision+1,notes:b.notes},raw=JSON.stringify(out);if(Buffer.byteLength(raw)>3000000)return res.status(413).json({error:'Слишком много материалов. Скачай архив и убери ненужные референсы.'});
 const ok=await redis(['EVAL',CAS,1,key,String(b.revision),raw]);if(!ok)return res.status(409).json({error:'Данные изменились на другом устройстве'});
 return res.status(200).json({revision:out.revision});
 }catch{return res.status(500).json({error:'Не удалось связаться с хранилищем. Локальные заметки сохранены.'})}
}
