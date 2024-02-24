import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsProfileScreen from "../../../containers/SettingsProfileScreen";
const Stack = createNativeStackNavigator();

function SettingsProfileNavigator() {
  return (
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen
        name="Settings"
        component={SettingsProfileScreen}
        options={{
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default SettingsProfileNavigator;
