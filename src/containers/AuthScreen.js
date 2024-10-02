import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoGreen from "../../assets/logo/logo";
import IconComponent from "../components/Icons";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed   EMAIL : " + email + " PASS : " + password);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 justify-center items-center w-full">
        <View className="items-center mb-8">
          <LogoGreen />
          <Text className="text-[#70E575] text-4xl text-center mt-4">
            Bienvenue
          </Text>
        </View>

        <View className="w-80">
          <Text className="mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded mb-4"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="default"
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email"
          />

          <Text className="mb-2">Password</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 p-2 rounded mb-4"
              placeholder="Enter your password"
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
        </View>

        <Pressable
          className="bg-[#70E575] w-80 p-4 rounded-full mt-4"
          onPress={handleLogin}
        >
          <Text className="text-white text-center">Login</Text>
        </Pressable>

        <Pressable className="mt-10">
          <Text className="text-[#70E575] text-center">
            Mot de passe oublié ?
          </Text>
        </Pressable>

        <Pressable className="mt-4 flex-row justify-center items-center">
          <Text className="text-slate-500 text-sm">
            Vous ne possédez pas de compte ?
          </Text>
          <Text className="text-[#70E575] ml-1 font-semibold text-sm">
            Créer un Compte
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
