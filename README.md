# Jolt Mobile

Jolt Mobile est une application mobile développée en React Native dans le cadre du projet 4LABO à SupInfo. Elle permet aux utilisateurs de suivre, partager et explorer des trajets en mobilité douce (trottinette, vélo, etc.), de gérer leur équipement, de consulter des entretiens, d’ajouter des adresses favorites et de profiter de nombreuses fonctionnalités communautaires.

---

## Fonctionnalités principales

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

---

## Installation

1. **Cloner le dépôt** :
    ```bash
    git clone <url-du-repo>
    cd <nom-du-repo>
    ```
2. **Installer les dépendances** :
    ```bash
    npm install
    # ou
    yarn install
    ```
3. **Lancer l’application** :
    - Android : `npm run android` ou `yarn android`
    - iOS : `npm run ios` ou `yarn ios`
    - Expo Go : `npx expo start` puis scanner le QR code

---

## Structure du projet

- `src/components` : Composants réutilisables (cartes, modals, bottom sheets, etc.)
- `src/containers` : Écrans principaux de l’application (Accueil, Profil, Trajets, etc.)
- `src/context` : Contextes React pour la gestion globale (auth, véhicules, notifications…)
- `src/hooks` : Hooks personnalisés (API, navigation, etc.)
- `src/Data` : Données statiques ou de test
- `src/utils` : Fonctions utilitaires

---

## Technologies utilisées

- **React Native** (Expo)
- **React Navigation** (navigation entre les écrans)
- **@gorhom/bottom-sheet** (bottom sheets interactifs)
- **react-native-maps** (cartographie)
- **expo-location** (géolocalisation)
- **expo-notifications** (notifications push)
- **Context API** (gestion globale de l’état)
- **Lottie** (animations)
- **Axios ou fetch** (requêtes API)

---

## Contribution

1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité ou correction.
3. Commitez vos modifications.
4. Poussez sur votre fork.
5. Ouvrez une pull request.

---

## Auteurs

Jolt Team — SupInfo 4LABO

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.