import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();
import MaintainsScreen from "../../../containers/MaintainsScreen";
import MaintainDetailScreen from "../../../containers/MaintainDetailScreen";
import MaintainHistoryScreen from "../../../containers/MaintainHistoryScreen";

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MaintainsList">
      <Stack.Screen
        name="MaintainsList"
        component={MaintainsScreen}
        options={{
          title: "Entretien",
        }}
      />
      <Stack.Screen
        name="MaintainDetail"
        component={MaintainDetailScreen}
        options={{ title: "Détail entretien" }}
      /> 
      <Stack.Screen
        name="MaintainHistory"
        component={MaintainHistoryScreen}
        options={{ title: "Historique" }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;
