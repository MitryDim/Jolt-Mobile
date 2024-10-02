/**
 * @imports
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";
import Styles from "./styles";
import NavigationIcons from "../../constants/NavigationIcons";
import ManeuverTypes, {
  DEFAULT_MANEUVER_TYPE,
} from "../../constants/ManeuverTypes";

/**
 * @component
 */
export default class ManeuverArrow extends Component {
  /**
   * propTypes
   * @type {}
   */
  static propTypes = {
    maneuver: PropTypes.object,
    size: PropTypes.number,
    opacity: PropTypes.number,
    color: PropTypes.any,
  };

  /**
   * defaultProps
   * @type {}
   */
  static defaultProps = {
    maneuver: undefined,
    size: 25,
    opacity: 1,
    color: "#000000",
  };

  /**
   * @constructor
   * @param props
   */
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @returns {XML}
   */
  render() {
    const styles = Styles(this.props);
    const icon =
      this.props.maneuver &&
      (ManeuverTypes[this.props.maneuver.type] || DEFAULT_MANEUVER_TYPE);

    return <Text style={styles.maneuverArrow}>{NavigationIcons[icon]}</Text>;
  }
}
