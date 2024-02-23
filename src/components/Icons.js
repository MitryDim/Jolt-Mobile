import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const IconComponent = ({ library, icon, ...props }) => {
  switch (library) {
    case "Ionicons":
      return <Ionicons name={icon} {...props} />;
    case "MaterialIcons":
      return <MaterialIcons name={icon} {...props} />;
    // Ajoutez plus de cas si vous utilisez d'autres bibliothèques d'icônes
    default:
      return null;
  }
};


export default IconComponent;