import { useState } from 'react';

const join = (b) => b.replace(/\/+$/, '') + '/chat/completions';

function snippet(p, lang) {
    if (lang === 'js')
        return `import OpenAI from "openai"; // npm i openai
const client = new OpenAI({ baseURL: "${p.base}", apiKey: process.env.${p.envKey || 'API_KEY'} });
const res = await client.chat.completions.create({
  model: "${p.model}",
  messages: [{ role: "user", content: "Bonjour !" }],
});
console.log(res.choices[0].message.content);`;
    return `curl ${join(p.base)} \\
  -H "Authorization: Bearer $${p.envKey || 'API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"${p.model}","messages":[{"role":"user","content":"Bonjour !"}]}';`;
}

export default function Modal({ p, onClose }) {
    const [copied, setCopied] = useState('');
    const copy = (txt, tag) =>
        navigator.clipboard.writeText(txt).then(() => {
            setCopied(tag);
            setTimeout(() => setCopied(''), 1200);
        });

    return (
        <div
            className="modal"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="mbox">
                <button
                    className="close"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3>
                    {p.emoji} {p.name}
                </h3>
                <div className="badges">
                    <span className={`b ${p.cat}`}>{p.cat === 'free' ? 'GRATUIT' : 'CRÉDITS'}</span>
                    {p.fast && <span className="b fast">⚡ RAPIDE</span>}
                    {p.openai && <span className="b oai">OpenAI-compatible</span>}
                    {p.hasServerKey && <span className="b key">🔑 clé serveur OK</span>}
                </div>
                <p>
                    <b>📈 Limites :</b> {p.limits}
                </p>
                <p>
                    <b>🎯 Idéal pour :</b> {p.best}
                </p>
                <p style={{ color: 'var(--muted)' }}>{p.note}</p>
                <div className="chips">
                    {p.models.map((m) => (
                        <span
                            key={m}
                            className="chip"
                        >
                            {m}
                        </span>
                    ))}
                </div>
                {p.url && (
                    <p>
                        <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            👉 Site officiel
                        </a>
                    </p>
                )}
                {p.base ? (
                    <>
                        <p className="snippet-title">💻 Démarrage rapide</p>
                        <pre>
                            <button
                                className="copy"
                                onClick={() => copy(snippet(p, 'js'), 'js')}
                            >
                                {copied === 'js' ? 'Copié ✓' : 'Copier'}
                            </button>
                            <code>{snippet(p, 'js')}</code>
                        </pre>
                        <pre>
                            <button
                                className="copy"
                                onClick={() => copy(snippet(p, 'curl'), 'curl')}
                            >
                                {copied === 'curl' ? 'Copié ✓' : 'Copier'}
                            </button>
                            <code>{snippet(p, 'curl')}</code>
                        </pre>
                    </>
                ) : (
                    <p className="snippet-title">Proxy non configuré pour ce fournisseur — code sur son site.</p>
                )}
            </div>
        </div>
    );
}
