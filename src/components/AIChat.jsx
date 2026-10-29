import { useState, useRef } from 'react';

export default function AIChat({ provider, onBack }) {
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Bonjour ! Je suis connecté via ${provider.name}. Comment puis-je vous aider avec vos fichiers ?` }
    ]);
    const [input, setInput] = useState('');
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...uploadedFiles]);
    };

    const sendMessage = async () => {
        if (!input.trim() && files.length === 0) return;

        const userMessage = {
            role: 'user',
            text: input,
            files: files.map(f => f.name)
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setFiles([]);

        // Simulation de réponse IA
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `J'ai bien reçu votre message ${userMessage.files.length > 0 ? `et vos ${userMessage.files.length} fichier(s)` : ''}. En tant que modèle ${provider.best}, je peux analyser ces données pour vous.`
            }]);
        }, 1000);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={onBack} className="btn-back">← Retour</button>
                <h2>Chat avec {provider.name}</h2>
                <span className="badge-model">{provider.best}</span>
            </div>

            <div className="chat-messages">
                {messages.map((m, i) => (
                    <div key={i} className={`msg ${m.role}`}>
                        <div className="msg-content">
                            {m.text}
                            {m.files && m.files.length > 0 && (
                                <div className="msg-files">
                                    {m.files.map(f => <span key={f} className="file-tag">📄 {f}</span>)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input-area">
                <div className="file-preview">
                    {files.map((f, i) => (
                        <span key={i} className="file-chip">{f.name} ✕</span>
                    ))}
                </div>
                <div className="input-row">
                    <button
                        className="btn-add-file"
                        onClick={() => fileInputRef.current.click()}
                        title="Ajouter des fichiers"
                    >
                        ＋
                    </button>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <input
                        type="text"
                        placeholder="Posez votre question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button className="btn-send" onClick={sendMessage}>Envoyer</button>
                </div>
            </div>
        </div>
    );
}
