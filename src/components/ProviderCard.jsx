export default function ProviderCard({ p, onOpen, onChat }) {
    return (
        <div
            className="card"
            onClick={() => onOpen(p)}
        >
            <h3>
                {p.emoji} {p.name}
            </h3>
            <div className="badges">
                <span className={`b ${p.cat}`}>{p.cat === 'free' ? 'GRATUIT' : 'CRÉDITS'}</span>
                {p.fast && <span className="b fast">⚡ RAPIDE</span>}
                {p.openai && <span className="b oai">OpenAI-compatible</span>}
                {p.hasServerKey && <span className="b key">🔑 clé serveur</span>}
            </div>
            <div className="limits">📈 {p.limits}</div>
            <div className="chips">
                {p.models.slice(0, 3).map((m) => (
                    <span
                        key={m}
                        className="chip"
                    >
                        {m}
                    </span>
                ))}
                {p.models.length > 3 && <span className="chip">+{p.models.length - 3}</span>}
            </div>
            <div className="best">🎯 {p.best}</div>
            <div className="card-actions">
                <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    S'inscrire ↗
                </a>
                {p.hasServerKey && (
                    <button
                        className="btn-chat"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChat(p);
                        }}
                    >
                        💬 Chat IA
                    </button>
                )}
            </div>
        </div>
    );
}
