/**
 * @imports
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import RenderHtml from "react-native-render-html"; // Importez la bibliothèque

import Styles from "./styles";
import { formatDistance } from "../../utils/Utils";

/**
 * @component
 */
export default class ManeuverLabel extends Component {
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
