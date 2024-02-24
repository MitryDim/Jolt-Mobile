import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();
import MaintainsScreen from "../../../containers/MaintainsScreen";

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MaintainsList">
      <Stack.Screen
        name="MaintainsList"
        component={MaintainsScreen}
        options={{
          title: "Entretient",
        }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;
