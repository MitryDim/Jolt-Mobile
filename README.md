<h1 align="center">
  <img src="https://img.icons8.com/color/96/000000/electric-scooter.png" width="48" alt="Jolt Logo"/>
  <br>
  Jolt Mobile
</h1>

<p align="center">
  <strong>La mobilité douce, connectée et communautaire.</strong><br>
  Suivez, partagez et explorez vos trajets en trottinette, vélo, et plus encore !
</p>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-green" alt="iOS | Android" />
  <img src="https://img.shields.io/badge/expo-%5E53.0.13-blueviolet" alt="Expo" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
</p>

<h3 align="center">
  <a href="#-fonctionnalités">Fonctionnalités</a>
  <span> · </span>
  <a href="#-installation">Installation</a>
  <span> · </span>
  <a href="#-configuration">Configuration</a>
  <span> · </span>
  <a href="#-contribution">Contribution</a>
</h3>

---

Jolt Mobile apporte la puissance de React Native à la mobilité douce :  
- **Déclaratif** : Une interface fluide et prévisible, facile à maintenir.
- **Basé sur les composants** : Chaque fonctionnalité est encapsulée dans des composants réutilisables.
- **Expérience utilisateur moderne** : Animations, navigation intuitive, notifications push, gestion du mode hors-ligne.
- **Portabilité** : Fonctionne sur iOS et Android, avec un code partagé.

---

## 📦 Fonctionnalités

- **Authentification sécurisée** : Inscription, connexion, gestion du profil utilisateur.
- **Accueil personnalisé** : Vue synthétique de l’équipement, des trajets, des rides à venir.
- **Gestion des trajets** :
  - Historique personnel ("Mes trajets")
  - Trajets partagés par la communauté
  - Rides organisés à proximité, filtrables par localisation
- **Filtrage avancé** :
  - Recherche par ville ou autour de soi (géolocalisation)
  - Filtrage par rayon autour d’une position
- **Gestion de l’équipement** :
  - Ajout, modification, suppression de véhicules
  - Suivi des entretiens à faire et à venir
- **Favoris** :
  - Ajout et gestion d’adresses favorites
- **Cartographie interactive** :
  - Visualisation des trajets sur une carte
  - Navigation étape par étape avec instructions vocales
- **Notifications** :
  - Notifications push pour les événements importants

---

## 📋 Prérequis

- Node.js >= 18.x
- npm ou yarn
- Android Studio ou Xcode (pour l’émulation)
- Expo CLI (recommandé)
- Accès à une API Gateway compatible (voir [Configuration](#-configuration))

---

## 🚀 Installation

1. **Cloner le dépôt** :
    ```bash
    git clone https://github.com/MitryDim/Jolt-Mobile
    cd Jolt-Mobile
    ```
2. **Configurer les variables d’environnement** (voir [Configuration](#-configuration))
3. **Installer les dépendances** :
    ```bash
    npm install
    # ou
    yarn install
    ```
4. **Lancer l’application** :
    - Android : `npm run android` ou `yarn android`
    - iOS : `npm run ios` ou `yarn ios`
    - Expo Go : `npx expo start` puis scanner le QR code

---

## ⚙️ Configuration

Avant de lancer l’application, créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# URL de votre API Gateway (backend)
EXPO_GATEWAY_SERVICE_URL=http://<adresse-ip-ou-domaine>:<port>

# Clé API pour OpenRouteService (obtenue sur https://openrouteservice.org/sign-up/)
EXPO_API_KEY_OPENROUTESERVICE=YOUR_OPENROUTESERVICE_API_KEY

# URL du service OpenRouteService (laisser par défaut sauf si vous hébergez votre propre instance)
EXPO_OPENROUTESERVICE_URL=https://api.openrouteservice.org
```

**Exemple :**

```env
EXPO_GATEWAY_SERVICE_URL=http://192.168.1.88:5000
EXPO_API_KEY_OPENROUTESERVICE=abcdef1234567890
EXPO_OPENROUTESERVICE_URL=https://api.openrouteservice.org
```

> ⚠️ **Assurez-vous que l’API Gateway et OpenRouteService soient accessibles depuis votre appareil ou émulateur.**

---

## 🗂 Structure du projet

- `src/components` : Composants réutilisables (cartes, modals, bottom sheets, carrousels, etc.)
- `src/containers` : Écrans principaux (Accueil, Profil, Trajets, Carte, Authentification, etc.)
- `src/context` : Contextes React (authentification, véhicules, notifications…)
- `src/hooks` : Hooks personnalisés (API, navigation, etc.)
- `src/constants` : Constantes globales (icônes, couleurs…)
- `src/utils` : Fonctions utilitaires (API, helpers, sockets, etc.)
- `src/providers` : Providers globaux (React Query, etc.)
- `src/queries` : Fonctions de requêtes pour les données distantes

---

## 🛠 Technologies utilisées

- **React Native** (Expo)
- **React Navigation**
- **@gorhom/bottom-sheet**
- **react-native-maps**
- **expo-location**
- **expo-notifications**
- **Context API**
- **React Query**
- **Lottie**
- **Socket.io**
- **fetch**

---

## 🤝 Contribution

1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité ou correction.
3. Commitez vos modifications.
4. Poussez sur votre fork.
5. Ouvrez une pull request.

Merci de respecter la structure du projet et les conventions de nommage.

---

## 👨‍💻 Auteurs

Jolt Team — SupInfo 4LABO

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.