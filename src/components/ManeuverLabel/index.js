/**
 * @imports
 */
import React, { Component, useRef } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import RenderHtml from "react-native-render-html"; // Importez la bibliothèque
import * as Speech from "expo-speech";
import Styles from "./styles";
import { formatDistance } from "../../utils/Utils";

/**
 * @component
 */
export default class ManeuverLabel extends Component {
  announcedDistances = [];
  lastInstruction = "";
  /**
   * propTypes
   * @type {}
   */
  static propTypes = {
    instructions: PropTypes.string,
    distanceRest: PropTypes.number,
    fontFamily: PropTypes.string,
    fontFamilyBold: PropTypes.string,
    fontSize: PropTypes.number,
    fontColor: PropTypes.string,
  };

  /**
   * defaultProps
   * @type {}
   */
  static defaultProps = {
    instructions: "",
    distanceRest: 0,
    fontFamily: undefined,
    fontFamilyBold: undefined,
    fontSize: 15,
    fontColor: undefined,
  };

  /**
   * render
   * @returns {XML}
   */
  render() {
    const styles = Styles(this.props);

    function stripHtml(html) {
      return html.replace(/<[^>]*>?/gm, "");
    }
    const thresholds = [500, 200, 50, 5];
    const instructionHtml = this.props.instructions; // ou autre source
    const instructionText = stripHtml(instructionHtml);

    if (this.lastInstruction !== instructionHtml) {
      this.announcedDistances = [];
      this.lastInstruction = instructionHtml;
    }

    if (instructionText || instructionText.trim() !== "") {
      for (const threshold of thresholds) {
        if (
          this.props.distanceRest <= threshold &&
          !this.announcedDistances.includes(threshold)
        ) {
          let message = "";

          if (threshold === 5) {
            message = `${instructionText}`;
          } else {
            message = `Dans ${threshold} mètres, ${instructionText}`;
          }

          //   setCurrentInstruction(message);
          Speech.speak(message, {
            rate: 1.0,
            pitch:1.0, 
            language: "fr-FR",
          });

          this.announcedDistances.push(threshold);
          break;
        }
      }
    }
    return (
      <View style={styles.maneuverLabel}>
        <Text style={{ fontWeight: "bold" }}>
          {formatDistance(this.props.distanceRest)}
        </Text>
        <RenderHtml
          source={{ html: this.props.instructions }} // Utilisez la source HTML
          contentWidth={200} // Spécifiez la largeur de contenu, ajustez selon vos besoins
        />
      </View>
    );
  }
}
