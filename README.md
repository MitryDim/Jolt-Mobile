# Jolt Mobile

Jolt Mobile est une application mobile développée en React Native (Expo) dans le cadre du projet 4LABO à SupInfo. Elle permet aux utilisateurs de suivre, partager et explorer des trajets en mobilité douce (trottinette, vélo, etc.), de gérer leur équipement, de consulter les entretiens, d’ajouter des adresses favorites et de profiter de nombreuses fonctionnalités communautaires.

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Contribution](#contribution)
- [Auteurs](#auteurs)
- [Licence](#licence)

---

## Fonctionnalités

- **Authentification sécurisée** : Inscription, connexion, gestion du profil utilisateur.
- **Accueil personnalisé** : Accès rapide à son équipement, ses derniers trajets, les trajets partagés et les rides à venir proches de soi.
- **Gestion des trajets** :
  - Visualisation de ses propres trajets ("Mes trajets").
  - Accès aux trajets partagés par la communauté.
  - Découverte des rides organisés à proximité, filtrables par localisation.
- **Filtrage avancé** :
  - Recherche par ville ou autour de soi (géolocalisation).
  - Filtrage par rayon autour d’une position.
- **Gestion de l’équipement** :
  - Ajout, modification et suppression de véhicules.
  - Suivi des entretiens à faire et à venir.
- **Favoris** :
  - Ajout et gestion d’adresses favorites.
- **Cartographie interactive** :
  - Visualisation des trajets sur une carte.
  - Navigation étape par étape avec instructions.
- **Notifications** :
  - Réception de notifications push pour les événements importants.
- **Expérience utilisateur fluide** :
  - Interface moderne, animations, gestion du mode hors-ligne, etc.

---

## Prérequis

- Node.js >= 18.x
- npm ou yarn
- Android Studio ou Xcode (pour l’émulation)
- Expo CLI (recommandé)
- Accès à une API Gateway compatible (voir configuration)

---

## Installation

1. **Cloner le dépôt** :
    ```bash
    git clone <url-du-repo>
    cd <nom-du-repo>
    ```
2. **Configurer les variables d’environnement** (voir [Configuration](#configuration))
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

## Configuration

Avant de lancer l’application, créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
EXPO_GATEWAY_SERVICE_URL=http://<adresse-ip-ou-domaine>:<port>
```

Exemple :

```env
EXPO_GATEWAY_SERVICE_URL=http://192.168.1.88:5000
```

Assurez-vous que l’API Gateway soit accessible depuis votre appareil ou émulateur.

---

## Structure du projet

- `src/components` : Composants réutilisables (cartes, modals, bottom sheets, carrousels, etc.)
- `src/containers` : Écrans principaux de l’application (Accueil, Profil, Trajets, Carte, Authentification, etc.)
- `src/context` : Contextes React pour la gestion globale (authentification, véhicules, notifications…)
- `src/hooks` : Hooks personnalisés (API, navigation, etc.)
- `src/constants` : Constantes globales (icônes, couleurs…)
- `src/utils` : Fonctions utilitaires (API, helpers, sockets, etc.)
- `src/providers` : Providers globaux (React Query, etc.)
- `src/queries` : Fonctions de requêtes pour les données distante
---

## Technologies utilisées

- **React Native** (Expo)
- **React Navigation** (navigation entre les écrans)
- **@gorhom/bottom-sheet** (bottom sheets interactifs)
- **react-native-maps** (cartographie)
- **expo-location** (géolocalisation)
- **expo-notifications** (notifications push)
- **Context API** (gestion globale de l’état)
- **React Query** (gestion du cache et des requêtes API)
- **Lottie** (animations)
- **fetch** (requêtes API Gateway)
- **Socket.io** (communication temps réel pour certains modules)

---

## Contribution

1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité ou correction.
3. Commitez vos modifications.
4. Poussez sur votre fork.
5. Ouvrez une pull request.

Merci de respecter la structure du projet et les conventions de nommage.

---

## Auteurs

Jolt Team — SupInfo 4LABO

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.