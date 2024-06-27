import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../../containers/ProfileScreen";
const Stack = createNativeStackNavigator();

function ProfileNavigator() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default ProfileNavigator;
