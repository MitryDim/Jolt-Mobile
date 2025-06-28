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
    const thresholds = [5, 50, 200, 500]; // ordre croissant
    const instructionHtml = this.props.instructions;
    const instructionText = stripHtml(instructionHtml);

    if (this.lastInstructionText !== instructionText) {
      this.announcedDistances = [];
      this.lastInstructionText = instructionText;
    }

    if (instructionText && instructionText.trim() !== "") {
      let thresholdToAnnounce = null;
      const margin = 10; // marge pour éviter d'annoncer un seuil trop éloigné

      for (const threshold of thresholds) {
        if (
          this.props.distanceRest <= threshold &&
          !this.announcedDistances.includes(threshold)
        ) {
          if (
            threshold <= this.props.distanceRest + margin ||
            threshold === 5
          ) {
            thresholdToAnnounce = threshold;
            break;
          }
        }
      }

      if (thresholdToAnnounce !== null) {
        let message = "";
        if (thresholdToAnnounce === 5) {
          message = instructionText;
        } else {
          message = `Dans ${thresholdToAnnounce} mètres, ${instructionText}`;
        }

        Speech.speak(message, {
          rate: 1.0,
          pitch: 1.0,
          language: "fr-FR",
        });

        this.announcedDistances.push(thresholdToAnnounce);
      }

      if (
        this.props.distanceRest <= 10 &&
        !this.announcedDistances.includes(5)
      ) {
        Speech.speak(instructionText, {
          rate: 1.0,
          pitch: 1.0,
          language: "fr-FR",
        });
        this.announcedDistances.push(5);
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
