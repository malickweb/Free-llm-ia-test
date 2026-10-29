import { useEffect, useState } from 'react';

export default function Playground({ providers }) {
    const list = providers.filter((p) => p.pg);
    const [pid, setPid] = useState(list[0]?.id || '');
    const [model, setModel] = useState(list[0]?.model || '');
    const [key, setKey] = useState(() => localStorage.getItem('llm_key') || '');
    const [prompt, setPrompt] = useState("Explique en une phrase ce qu'est une API LLM.");
    const [out, setOut] = useState('La réponse apparaîtra ici…');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        localStorage.setItem('llm_key', key);
    }, [key]);

    const select = (id) => {
        setPid(id);
        setModel(providers.find((p) => p.id === id)?.model || '');
    };

    const send = async () => {
        const p = providers.find((x) => x.id === pid);
        if (!pid || !p) return;
        if (!key && !p.hasServerKey) return setOut(`⚠️ Aucune clé : ajoute ${p.envKey} dans .env (côté serveur) ou colle une clé ci-dessous.`);
        setBusy(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(key ? { 'x-api-key': key } : {}) },
                body: JSON.stringify({ provider: pid, model, messages: [{ role: 'user', content: prompt }] }),
            });
            const data = await res.json().catch(() => ({ error: 'Réponse non-JSON du fournisseur' }));
            if (!res.ok) setOut(`❌ HTTP ${res.status}\n${data.error || JSON.stringify(data).slice(0, 400)}`);
            else setOut((data.choices?.[0]?.message?.content ?? JSON.stringify(data, null, 2)) + (data.usage ? `\n\n📊 tokens : ${data.usage.prompt_tokens} entrée / ${data.usage.completion_tokens} sortie` : ''));
        } catch (e) {
            setOut('❌ ' + e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="playground">
            <div className="pg-row">
                <select
                    value={pid}
                    onChange={(e) => select(e.target.value)}
                >
                    {list.map((p) => (
                        <option
                            key={p.id}
                            value={p.id}
                        >
                            {p.emoji} {p.name}
                            {p.hasServerKey ? ' 🔑' : ''}
                        </option>
                    ))}
                </select>
                <input
                    type="password"
                    placeholder="Clé API optionnelle (sinon .env du serveur)"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
            </div>
            <div className="pg-row">
                <input
                    type="text"
                    style={{ flex: 1 }}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Modèle"
                />
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <div
                className="pg-row"
                style={{ marginTop: 10 }}
            >
                <button
                    className="btn"
                    onClick={send}
                    disabled={busy || !pid}
                >
                    {busy ? '⏳…' : 'Envoyer ▶'}
                </button>
            </div>
            <div id="pgOut">{out}</div>
        </section>
    );
}
