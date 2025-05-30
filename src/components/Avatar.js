
import {
  View,
  Text,
} from "react-native";
const Avatar = ({ username, style, textStyle }) => {
  const initials = username?.charAt(0)?.toUpperCase();

  return (
    <View className="flex justify-center w-10 h-10 font-bold rounded-full bg-blue-300" style={{...style}}>
      <Text className="text-white m-auto text-lg text-center" >{initials}</Text>
    </View>
  );
};

export default Avatar;
