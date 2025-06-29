import { StyleSheet } from "react-native";
import { IconFont } from "../../../constants/NavigationIcons";

export default (props) =>
  StyleSheet.create({
    maneuverLabel: {
      flexDirection: "column", // Pour empiler les éléments verticalement
      alignItems: "left", // Pour centrer les éléments horizontalement
      justifyContent: "center", // Pour centrer les éléments verticalement
    },
    bold: {
      fontWeight: "bold",
      fontFamily: props.fontFamilyBold || props.fontFamily,
      fontSize: props.fontSize,
      flexWrap: "wrap",
      color: props.color,
    },

    regular: {
      fontFamily: props.fontFamily,
      fontSize: props.fontSize,
      flexWrap: "wrap",
      color: props.color,
    },

    extra: {
      fontFamily: props.fontFamily,
      fontSize: props.fontSize * 0.8,
      flexWrap: "wrap",
      color: "#387bc1",
      marginTop: 4,
    },
  });
