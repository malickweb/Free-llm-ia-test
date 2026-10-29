const README_URL = 'https://raw.githubusercontent.com/cheahjs/free-llm-api-resources/main/README.md';

// Fournisseurs connus : permet de proxyfier les entrées trouvées dans le README
const KNOWN = [
    { re: /google ai studio/i, emoji: '✨', fast: true, base: 'https://generativelanguage.googleapis.com/v1beta/openai/', model: 'gemini-3.8-flash', envKey: 'GOOGLE_API_KEY' },
    { re: /groq/i, emoji: '🚀', fast: true, base: 'https://api.groq.com/openai/v1', model: 'openai/gpt-oss-120b', envKey: 'GROQ_API_KEY' },
    { re: /cerebras/i, emoji: '⚡', fast: true, base: 'https://api.cerebras.ai/v1', model: 'gpt-oss-120b', envKey: 'CEREBRAS_API_KEY' },
    { re: /mistral/i, emoji: '🌬️', fast: false, base: 'https://api.mistral.ai/v1', model: 'mistral-small-latest', envKey: 'MISTRAL_API_KEY' },
    { re: /github models/i, emoji: '🐙', fast: false, base: '', model: '', envKey: 'GITHUB_TOKEN' },
    { re: /openrouter/i, emoji: '🔀', fast: false, base: 'https://openrouter.ai/api/v1', model: 'google/gemma-4-31b-it:free', envKey: 'OPENROUTER_API_KEY' },
    { re: /nvidia/i, emoji: '🟩', fast: false, base: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-4-maverick-17b-128e-instruct', envKey: 'NVIDIA_API_KEY' },
    { re: /sambanova/i, emoji: '🟠', fast: true, base: 'https://api.sambanova.ai/v1', model: 'gpt-oss-120b', envKey: 'SAMBANOVA_API_KEY' },
    { re: /scaleway/i, emoji: '🇫🇷', fast: false, base: 'https://api.scaleway.ai/v1', model: 'qwen3.8-27b', envKey: 'SCALEWAY_API_KEY' },
    { re: /cohere/i, emoji: '🟣', fast: false, base: 'https://api.cohere.ai/compatibility/v1', model: 'command-a-03-2025', envKey: 'COHERE_API_KEY' },
    { re: /hugging face/i, emoji: '🤗', fast: false, base: 'https://router.huggingface.co/v1', model: 'openai/gpt-oss-120b', envKey: 'HF_TOKEN' },
    { re: /together/i, emoji: '🔵', fast: false, base: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', envKey: 'TOGETHER_API_KEY' },
];

const strip = (s) =>
    s
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[`*]/g, '')
        .trim();
const slug = (s) =>
    s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

export async function fetchReadme() {
    const r = await fetch(README_URL, { headers: { 'User-Agent': 'free-llm-explorer' } });
    if (!r.ok) throw new Error(`README fetch failed: ${r.status}`);
    return r.text();
}

export function parseFreeTierTable(md) {
    const lines = md.split('\n');
    const start = lines.findIndex((l) => /^#{1,6}\s.*(free tier)/i.test(l));
    if (start === -1) return [];

    const rows = [];
    for (let i = start + 1; i < lines.length; i++) {
        if (/^#{1,6}\s/.test(lines[i])) break; // section suivante
        if (lines[i].trim().startsWith('|')) rows.push(lines[i]);
    }

    const out = [];
    for (const row of rows) {
        const cells = row
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());
        if (cells.length < 2) continue;
        if (/^[-:\s]+$/.test(cells.join(''))) continue; // ligne séparatrice
        if (/^provider$/i.test(cells[0])) continue; // en-tête

        const link = cells[0].match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        const name = (link ? link[1] : strip(cells[0])).trim();
        if (!name || name.length > 60) continue;
        const url = link ? link[2] : null;

        const limitsCell = cells.find((c, i) => i > 0 && /RPM|TPM|RPD|neurons?|credits?|€|\$/i.test(c)) || cells.at(-1);
        const models = cells
            .filter((c, i) => i > 0 && c !== limitsCell)
            .join(', ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/`/g, '')
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6);

        const known = KNOWN.find((k) => k.re.test(name));
        out.push({
            id: slug(name),
            name,
            emoji: known?.emoji || '🔌',
            url,
            cat: 'free',
            openai: Boolean(known),
            fast: Boolean(known?.fast),
            rpd: 0,
            models: models.length ? models : ['—'],
            limits: strip(limitsCell) || '—',
            best: 'Extrait automatiquement du README du repo',
            note: known ? 'Données live + proxy configuré ✔' : 'Fournisseur trouvé dans le README (proxy non configuré)',
            base: known?.base || '',
            model: known?.model || '',
            envKey: known?.envKey || '',
            pg: Boolean(known),
        });
    }
    return out;
}
