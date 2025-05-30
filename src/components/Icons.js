import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  AntDesign,
  Entypo,
} from "@expo/vector-icons";

const IconComponent = ({ library, icon, ...props }) => {
  switch (library) {
    case "Ionicons":
      return <Ionicons name={icon} {...props} />;
    case "MaterialIcons":
      return <MaterialIcons name={icon} {...props} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={icon} {...props} />;
    case "AntDesign":
      return <AntDesign name={icon} {...props} />;
    case "Entypo":
      return <Entypo name={icon} {...props} />;
    default:
      return null;
  }
};

export default IconComponent;
