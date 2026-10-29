import { useEffect, useMemo, useState } from 'react';
import ProviderCard from './components/ProviderCard.jsx';
import Modal from './components/Modal.jsx';
import Playground from './components/Playground.jsx';

export default function App() {
    const [providers, setProviders] = useState([]);
    const [meta, setMeta] = useState({ source: '', updatedAt: null });
    const [repo, setRepo] = useState(null);
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('all');
    const [oai, setOai] = useState(false);
    const [fast, setFast] = useState(false);
    const [sort, setSort] = useState('rank');
    const [sel, setSel] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = () =>
        fetch('/api/providers')
            .then((r) => r.json())
            .then((d) => {
                setProviders(d.providers);
                setMeta({ source: d.source, updatedAt: d.updatedAt });
            });

    useEffect(() => {
        load();
        fetch('/api/repo')
            .then((r) => r.json())
            .then(setRepo)
            .catch(() => {});
    }, []);

    const refresh = async () => {
        setBusy(true);
        try {
            await fetch('/api/refresh');
            await load();
        } catch (e) {
            alert('Échec du refresh : ' + e.message);
        } finally {
            setBusy(false);
        }
    };

    const list = useMemo(() => {
        const needle = q.toLowerCase();
        let out = providers.filter((p) => (!needle || `${p.name} ${p.models.join(' ')} ${p.best} ${p.note}`.toLowerCase().includes(needle)) && (cat === 'all' || p.cat === cat) && (!oai || p.openai) && (!fast || p.fast));
        if (sort === 'rpd') out = [...out].sort((a, b) => (b.rpd || 0) - (a.rpd || 0));
        if (sort === 'name') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        return out;
    }, [providers, q, cat, oai, fast, sort]);

    return (
        <>
            <header>
                <h1>🆓 Free LLM APIs — Explorer</h1>
                <p>
                    Données :{' '}
                    <a
                        href="https://github.com/cheahjs/free-llm-api-resources"
                        target="_blank"
                        rel="noreferrer"
                    >
                        cheahjs/free-llm-api-resources
                    </a>
                    {repo?.stars != null && <> · ⭐ {repo.stars.toLocaleString('fr-FR')}</>}
                    {repo?.pushed_at && <> · MAJ repo {new Date(repo.pushed_at).toLocaleDateString('fr-FR')}</>}
                    {meta.updatedAt && (
                        <>
                            {' '}
                            · <b>source : {meta.source === 'readme-live' ? 'README live 🟢' : 'statique'}</b>
                        </>
                    )}
                </p>
                <div className="stats">
                    {providers.length} fournisseurs · {providers.filter((p) => p.cat === 'free').length} tiers gratuits · {providers.filter((p) => p.hasServerKey).length} clés serveur chargées 🔑
                    <button
                        className="refresh"
                        onClick={refresh}
                        disabled={busy}
                    >
                        {busy ? '⏳ Rafraîchissement…' : '🔄 Lire le README du repo'}
                    </button>
                </div>
            </header>

            <section className="controls">
                <input
                    type="text"
                    placeholder="🔍 Rechercher (fournisseur, modèle…)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                >
                    <option value="all">Toutes les offres</option>
                    <option value="free">Tier gratuit permanent</option>
                    <option value="trial">Crédits d'essai</option>
                </select>
                <label>
                    <input
                        type="checkbox"
                        checked={oai}
                        onChange={(e) => setOai(e.target.checked)}
                    />{' '}
                    Compatibles OpenAI
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={fast}
                        onChange={(e) => setFast(e.target.checked)}
                    />{' '}
                    ⚡ Ultra rapides
                </label>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="rank">Tri : recommandé</option>
                    <option value="rpd">Tri : volume/jour</option>
                    <option value="name">Tri : nom</option>
                </select>
            </section>

            <main>
                {list.map((p) => (
                    <ProviderCard
                        key={p.id}
                        p={p}
                        onOpen={setSel}
                    />
                ))}
                {!list.length && <p style={{ color: 'var(--muted)' }}>Aucun résultat 🤷</p>}
            </main>

            <h2 className="section">🧪 Testeur d'API (via le backend — zéro CORS)</h2>
            <Playground providers={providers} />

            {sel && (
                <Modal
                    p={sel}
                    onClose={() => setSel(null)}
                />
            )}

            <footer>⚠️ Limites indicatives — vérifie sur les sites officiels. N'utilise pas ces tiers en production.</footer>
        </>
    );
}
