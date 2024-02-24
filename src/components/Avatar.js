
import {
  View,
  Text,
} from "react-native";
const Avatar = ({ username, style,textStyle }) => {
  const initials = `${username?.charAt(0)}`;
  const avatarStyle = {
    borderRadius: 100,
    backgroundColor: "blue",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 20,
    ...style,
    
  };

  return (
    <View style={avatarStyle}>
      <Text style={{color: "white"}}>{initials}</Text>
    </View>
  );
};

export default Avatar;
