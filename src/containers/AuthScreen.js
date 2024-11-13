import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoGreen from "../../assets/logo/logo";
import IconComponent from "../components/Icons";

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed   EMAIL : " + email + " PASS : " + password);
  };

  const handleRegister = () => {
    console.log(
      "Register pressed   USERNAME : " +
        username +
        " EMAIL : " +
        email +
        " PASS : " +
        password
    );
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <SafeAreaView className="flex mb-[60px]">
      <View className="flex justify-center items-center h-screen m-auto">
        <View className="items-center mb-8">
          <LogoGreen />
          <Text className="text-[#70E575] text-4xl text-center mt-4">
            Bienvenue
          </Text>
        </View>

        <View className="w-80">
          {!isLogin && (
            <>
              <Text className="mb-2">Nom d'utilisateur</Text>
              <TextInput
                className="border border-gray-300 p-2 rounded-lg mb-4"
                placeholder="Entrer votre nom d'utilisateur"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </>
          )}

          <Text className="mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-lg mb-4"
            placeholder="Entrer votre email"
            value={email}
            onChangeText={setEmail}
            keyboardType="default"
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email"
          />

          <Text className="mb-2">Mot de Passe</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 p-2 rounded-lg mb-4"
              placeholder="Entrer votre mot de passe"
              value={password}
              onChangeText={setPassword}
              keyboardType="default"
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <Pressable
              className="absolute right-2 top-3"
              onPress={handleTogglePasswordVisibility}
            >
              <IconComponent
                library="Entypo"
                name={showPassword ? "lock-open" : "lock"}
                size={18}
                style={{ color: "#70E575" }}
              />
            </Pressable>
          </View>

          {!isLogin && (
            <>
              <Text className="mb-2">Confirmer le Mot de Passe</Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 p-2 rounded-lg mb-4"
                  placeholder="Confirmer votre mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  keyboardType="default"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password"
                />
                <Pressable
                  className="absolute right-2 top-3"
                  onPress={handleToggleConfirmPasswordVisibility}
                >
                  <IconComponent
                    library="Entypo"
                    name={showConfirmPassword ? "lock-open" : "lock"}
                    size={18}
                    style={{ color: "#70E575" }}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>

        <Pressable
          className="bg-[#70E575] w-80 p-4 rounded-full mt-4"
          onPress={isLogin ? handleLogin : handleRegister}
        >
          <Text className="text-white text-center">
            {isLogin ? "Connexion" : "Inscription"}
          </Text>
        </Pressable>

        {isLogin ? (
          <Pressable className="mt-10">
            <Text className="text-[#70E575] text-center">
              Mot de passe oublié ?
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          className="mt-4 flex-row justify-center items-center"
          onPress={handleAuthMode}
        >
          <Text className="text-slate-500 text-sm">
            {isLogin ? "Vous ne possédez pas de compte ?" : "Déjà un compte ?"}
          </Text>
          <Text className="text-[#70E575] ml-1 font-semibold text-sm">
            {isLogin ? "Créer un Compte" : "Connexion"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
