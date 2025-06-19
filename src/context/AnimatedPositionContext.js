import React, { createContext, useContext } from "react";
export const AnimatedPositionContext = createContext(null);
export const useAnimatedPosition = () => useContext(AnimatedPositionContext);
