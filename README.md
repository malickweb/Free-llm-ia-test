# 🆓 Free LLM APIs — Explorer

Une application moderne et intuitive pour explorer, filtrer et tester les API de Large Language Models (LLMs) gratuites ou avec des tiers d'essai.

L'application agrège des données provenant de ressources communautaires pour aider les développeurs à trouver rapidement des modèles performants sans frais initiaux.

## ✨ Fonctionnalités

- **Exploration Intuitive** : Parcourez une liste complète de fournisseurs d'API LLM.
- **Filtres Avancés** : 
    - Filtrage par catégorie (Permanent Free vs Trial Credits).
    - Filtre de compatibilité OpenAI.
    - Filtre pour les modèles "Ultra Rapides".
    - Recherche textuelle instantanée (fournisseurs, modèles, notes).
- **Tri Intelligent** : Triez les résultats par recommandation, volume quotidien (RPD), nom ou présence de clés API serveur.
- **Chat IA Intégré** : 
    - Interface de chat moderne pour chaque fournisseur.
    - **Analyse de fichiers** : Possibilité d'uploader des fichiers pour simuler une interaction RAG (Retrieval Augmented Generation).
    - Expérience utilisateur fluide avec auto-scroll et gestion de fichiers.
- **Playground (Testeur)** : Testez vos propres clés API directement depuis l'interface via un proxy backend pour contourner les problèmes de CORS.
- **Design Premium** : Interface sombre futuriste avec effets de flou (backdrop-filter), dégradés néons et animations fluides.

## 🚀 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+)
- npm

### Installation
```bash
# Cloner le dépôt
git clone <url-du-repo>
cd free-llm-explorer

# Installer les dépendances
npm install
```

### Lancement
```bash
# Lancer le serveur et le frontend en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

## 🛠️ Stack Technique

- **Frontend** : React 18, Vite, CSS3 (Custom Properties, Flexbox, Grid).
- **Backend** : Node.js, Express, CORS.
- **Données** : Parsing dynamique de READMEs GitHub et fichiers de données statiques.

## 📂 Structure du Projet

```text
├── server/             # Backend Node.js (Proxy API, Parser de données)
│   ├── index.js        # Point d'entrée serveur
│   └── data.js         # Gestion des données fournisseurs
├── src/                # Frontend React
│   ├── components/     # Composants UI (AIChat, ProviderCard, Modal, Playground)
│   ├── App.jsx         # Logique principale de l'application
│   └── styles.css      # Design system et styles globaux
└── index.html          # Point d'entrée HTML
```

## ⚠️ Avertissement
Les limites et conditions d'utilisation des API sont indicatives. Veuillez toujours vérifier les sites officiels des fournisseurs. **L'utilisation de ces tiers gratuits n'est pas recommandée pour des environnements de production.**

---
🤖 *Généré avec passion pour la communauté Open Source.*
