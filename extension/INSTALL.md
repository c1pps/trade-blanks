# Blanks — installation

Paper trading sur Terminal (Padre). Portefeuille virtuel, exécution réaliste
(price impact, frais, slippage, délai), ordres TP / SL / limit, marqueurs sur leur chart.

**Rien ne sort de ton navigateur.** Aucun compte, aucune clé, aucune connexion à un
wallet. Les seuls appels réseau sont des prix publics (Jupiter, Coinbase, Binance,
Kraken, CoinGecko, DexScreener). Ton portefeuille virtuel reste dans le stockage local
de l'extension.

## Installer

1. Dézippe ce dossier quelque part où il restera — **ne le supprime pas après**,
   Chrome lit les fichiers à cet endroit à chaque démarrage.
2. Ouvre `chrome://extensions` (ou `brave://extensions`, `edge://extensions`).
3. Active **Mode développeur**, en haut à droite.
4. Clique **Charger l'extension non empaquetée** et sélectionne le dossier dézippé
   (celui qui contient `manifest.json`).
5. Ouvre un token sur https://trade.padre.gg — le panneau apparaît en haut à gauche.

Chrome affichera au démarrage un bandeau « Désactiver les extensions en mode
développeur ». C'est normal pour une extension installée hors du Web Store :
clique sur la croix, ne clique pas sur « Désactiver ».

## Mettre à jour

Remplace les fichiers du dossier par les nouveaux, va sur `chrome://extensions`,
clique **↻** sur la carte Blanks, puis recharge ton onglet Terminal. Les deux étapes
sont nécessaires. Le numéro de version s'affiche en bas de l'onglet ⚙.

## Si ça ne marche pas

Le panneau n'apparaît que sur une page de token (`/trade/solana/...`), comme le leur.

S'il affiche une ligne du genre :

```
px ✓ mc ✓ liq ✓ sup ✓ curve ✓ mint ✗ sol ✗ addr ✓ · quote ✗ · sw sol=0 w1
```

chaque ✗ est un maillon qui manque. Le plus fréquent : **`sol ✗`** — ton bloqueur de
pub coupe les API de prix. Solution : ⚙ → Wallet → **SOL price**, tape le cours du SOL,
Entrée. Ou mets `trade.padre.gg` en liste blanche dans ton bloqueur.

## Sons

⚙ → Sound. Par défaut deux bips synthétisés. **Buy file… / Sell file…** permettent de
charger tes propres fichiers audio pour retrouver exactement les sons de Terminal.

## Réinitialiser

⚙ → Wallet → **Reset wallet**. L'historique se perd, pense à l'exporter en CSV avant
(onglet History).
