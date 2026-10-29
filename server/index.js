import express from 'express';
import cors from 'cors';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROVIDERS } from './data.js';
import { fetchReadme, parseFreeTierTable } from './readme-parser.js';

// --- Mini loader .env (zéro dépendance) ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = (m[2] || '').replace(/^["']|["']$/g, '').trim();
    }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

let live = null; // données parsées du README
let liveAt = null;

const decorate = (list) => list.map((p) => ({ ...p, hasServerKey: Boolean(process.env[p.envKey || '']) }));

app.get('/api/providers', (_req, res) => {
    res.json({
        source: live ? 'readme-live' : 'static',
        updatedAt: liveAt,
        providers: decorate(live || PROVIDERS),
    });
});

// Rafraîchit les données depuis le README du repo GitHub
app.get('/api/refresh', async (_req, res) => {
    try {
        const md = await fetchReadme();
        const parsed = parseFreeTierTable(md);
        if (parsed.length) {
            live = parsed;
            liveAt = new Date().toISOString();
        }
        res.json({ ok: true, count: parsed.length, updatedAt: liveAt, source: 'readme-live' });
    } catch (e) {
        res.status(502).json({ ok: false, error: String(e.message || e) });
    }
});

app.get('/api/repo', async (_req, res) => {
    try {
        const r = await fetch('https://api.github.com/repos/cheahjs/free-llm-api-resources');
        const d = await r.json();
        res.json({ stars: d.stargazers_count, pushed_at: d.pushed_at, url: d.html_url });
    } catch {
        res.json({});
    }
});

// Proxy chat → solutionne le CORS + garde les clés côté serveur
app.post('/api/chat', async (req, res) => {
    const { provider, model, messages } = req.body || {};
    const p = PROVIDERS.find((x) => x.id === provider) || (live || []).find((x) => x.id === provider);
    if (!p?.base) return res.status(400).json({ error: 'Fournisseur inconnu ou non proxy-able' });

    const key = req.headers['x-api-key'] || process.env[p.envKey || ''];
    if (!key) return res.status(400).json({ error: `Aucune clé : définis ${p.envKey} dans .env ou envoie l'en-tête x-api-key` });

    try {
        const url = p.base.replace(/\/+$/, '') + '/chat/completions';
        const upstream = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages }),
        });
        const text = await upstream.text();
        res.status(upstream.status).type('application/json').send(text);
    } catch (e) {
        res.status(502).json({ error: 'Upstream failed: ' + (e.message || e) });
    }
});

// Sert le build React en production
const dist = path.join(__dirname, '..', 'dist');
app.use(express.static(dist));
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(path.join(dist, 'index.html'));
    next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ API sur http://localhost:${PORT}`));
