export default ({ config }) => ({
  ...config,
  expo: {
    ...config?.expo,
    newArchEnabled: true,
    scheme: "jolt",
    name: "jolt-mobile",
    slug: "jolt",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sup.joltmobile",
      infoPlist: {
        locationAlwaysAndWhenInUsePermission:
          "Permettez à Jolt d'utiliser votre localisation pour améliorer votre expérience.",
        UIBackgroundModes: ["remote-notification", "remote-notification"],
      },
      entitlements: {
        "aps-environment": "production",
      },
      associatedDomains: [
        `applinks:${process.env.EXPO_URL_JOLT_WEBSITE_HOST || "localhost"}`,
      ],
    },
    androidNavigationBar: {
      backgroundColor: "white",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#70E575",
      },
      package: "com.anonymous.joltmobile",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: process.env.EXPO_URL_JOLT_WEBSITE_SCHEME || "http",
              host: process.env.EXPO_URL_JOLT_WEBSITE_HOST || "localhost",
              port: process.env.EXPO_URL_JOLT_WEBSITE_PORT || "8000",
            },
            {
              scheme: "jolt",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      // Utilisation de la variable d'environnement EAS pour le fichier google-services.json
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Permettez à Jolt d'utiliser votre localisation pour améliorer votre expérience.",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/avatar.png",
          color: "#ffffff",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./assets/icon.png",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      "expo-font",
      "expo-secure-store",
    ],
    extra: {
      eas: {
        projectId: "60033ee7-9be5-4b4e-99b7-e53910ad40f4",
      },
    },
    owner: "mitrydim",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/60033ee7-9be5-4b4e-99b7-e53910ad40f4",
    },
  },
});
