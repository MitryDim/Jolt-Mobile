import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../../containers/ProfileScreen";
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
    </Stack.Navigator>
  );
}

export default ProfileNavigator;
