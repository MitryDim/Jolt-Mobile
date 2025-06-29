<h1 align="center">
  <img src="https://img.icons8.com/color/96/000000/electric-scooter.png" width="48" alt="Jolt Logo"/>
  <br>
  Jolt Mobile
</h1>

<p align="center">
  <strong>La mobilité douce, connectée et communautaire.</strong><br>
  L’application mobile pour suivre, partager et explorer vos trajets en trottinette, vélo, et plus encore.<br>
  <a href="https://github.com/MitryDim/Jolt-Web">Voir aussi la version Web</a>
</p>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-green" alt="iOS | Android" />
  <img src="https://img.shields.io/badge/Expo-53.0.13-blueviolet" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.73.x-61dafb?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
</p>

<h3 align="center">
  <a href="#-fonctionnalités">Fonctionnalités</a>
  <span> · </span>
  <a href="#-installation">Installation</a>
  <span> · </span>
  <a href="#️-configuration">Configuration</a>
  <span> · </span>
  <a href="#-tests">Tests</a>
  <span> · </span>
  <a href="#-contribution">Contribution</a>
</h3>

---

## ✨ Présentation

**Jolt Mobile** vous accompagne dans tous vos déplacements doux :

- **Planifiez et suivez vos trajets** à vélo, trottinette ou tout autre moyen de transport léger.
- **Retrouvez vos itinéraires favoris** et consultez l’historique de vos rides.
- **Découvrez les parcours de la communauté** et participez à des rides organisés près de chez vous.
- **Gérez facilement votre matériel** : véhicules, entretiens, favoris, notifications, etc.

Profitez d’une application moderne, intuitive et pensée pour simplifier vos déplacements au quotidien !

---

## 🎬 Démonstrations vidéo

<div align="center">
  <a href="https://www.youtube.com/watch?v=Sbn73_U766M" target="_blank">
    <img src="https://img.youtube.com/vi/Sbn73_U766M/0.jpg" width="320" alt="Test vidéo 1"/>
  </a>
  <a href="https://youtu.be/m4R4yN3Y35E" target="_blank">
    <img src="https://img.youtube.com/vi/m4R4yN3Y35E/0.jpg" width="320" alt="Test vidéo 2"/>
  </a>
</div>

---

## 📦 Fonctionnalités principales

<div align="center">

<table>
    <tr>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/add-user-group-man-man.png" alt="Inscription et Connexion"/><br>
            <b>S’inscrire & Se connecter</b><br>
            Créez un compte, connectez-vous et gérez votre profil en toute sécurité.
        </td>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/route.png" alt="Trajets"/><br>
            <b>Gérer ses trajets</b><br>
            Visualisez, filtrez et partagez vos trajets ou ceux de la communauté.
        </td>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/scooter.png" alt="Matériel"/><br>
            <b>Gérer son matériel</b><br>
            Ajoutez, modifiez ou supprimez vos véhicules et suivez leur entretien.
        </td>
    </tr>
    <tr>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/marker.png" alt="Favoris"/><br>
            <b>Favoris & Cartographie</b><br>
            Ajoutez des adresses favorites et visualisez vos trajets sur la carte.
        </td>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/appointment-reminders.png" alt="Notifications"/><br>
            <b>Notifications</b><br>
            Recevez des alertes pour les événements importants et entretiens à venir.
        </td>
        <td align="center" valign="top" width="220">
            <img src="https://img.icons8.com/fluency/48/000000/settings.png" alt="Paramètres"/><br>
            <b>Paramètres avancés</b><br>
            Gérez vos préférences, filtres de recherche et personnalisez l’expérience.
        </td>
    </tr>
</table>

</div>

---

## 📋 Prérequis

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **Android Studio** ou **Xcode** (pour l’émulation)
- **Expo CLI** (recommandé)
- Accès à une API Gateway compatible (voir [Configuration](#️-configuration))

---

## 🚀 Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/MitryDim/Jolt-Mobile
   cd Jolt-Mobile
   ```
2. **Configurer les variables d’environnement** (voir [Configuration](#️-configuration))
3. **Installer les dépendances** :
   ```bash
   npm install
   # ou
   yarn install
   ```
4. **Lancer l’application** :
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

- `src/components` : Composants réutilisables (cartes, modals, bottom sheets, etc.)
- `src/containers` : Écrans principaux (Accueil, Profil, Trajets, Carte, Authentification, etc.)
- `src/context` : Contextes React (authentification, véhicules, notifications…)
- `src/hooks` : Hooks personnalisés (API, navigation, etc.)
- `src/constants` : Constantes globales (icônes, couleurs…)
- `src/utils` : Fonctions utilitaires (API, helpers, sockets, etc.)
- `src/providers` : Providers globaux (React Query, etc.)
- `src/queries` : Fonctions de requêtes pour les données distantes

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

## 🧪 Tests

Les tests sont réalisés avec **Jest** et **@testing-library/react-native**.

**Exemple de test d’un composant** :

```js
import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "../containers/HomeScreen";

test("affiche le titre Accueil", () => {
  const { getByText } = render(<HomeScreen />);
  expect(getByText("Accueil")).toBeTruthy();
});
```

Pour lancer les tests :

```bash
npm test
```

---

## 🤝 Contribution

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité ou correction
3. Commitez vos modifications
4. Poussez sur votre fork
5. Ouvrez une pull request

Merci de respecter la structure du projet et les conventions de nommage.

---

## 👨‍💻 Auteurs

Jolt Team — SupInfo 4LABO

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.