import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../../containers/ProfileScreen";
import EditProfileScreen from "../../../containers/EditProfileScreen";
const Stack = createNativeStackNavigator();

function ProfileNavigator() {
  return (
    <Stack.Navigator initialRouteName="ProfileScreen">
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ 
          title: "Modifier le profil",
          headerTitleAlign: "center",
          headerTintColor: "#000",
          headerStyle: {
            backgroundColor: "#fff",
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default ProfileNavigator;
