import colors from "assets/theme/base/colors";
import boxShadow from "assets/theme/functions/boxShadow";

const { dark, white, gradients, tabs } = colors;

const boxShadows = {
  xs: boxShadow([0, 2], [9, -5], dark.main, 0.15),
  sm: boxShadow([0, 5], [10, 0], dark.main, 0.12),
  md: `${boxShadow([0, 4], [6, -1], dark.main, 0.1)}, ${boxShadow([0, 2], [4, -1], dark.main, 0.06)}`,
  lg: `${boxShadow([0, 10], [15, -3], dark.main, 0.1)}, ${boxShadow([0, 4], [6, -2], dark.main, 0.05)}`,
  xl: `${boxShadow([0, 20], [25, -5], dark.main, 0.1)}, ${boxShadow([0, 10], [10, -5], dark.main, 0.04)}`,
  xxl: boxShadow([0, 20], [27, 0], dark.main, 0.05),
  inset: boxShadow([0, 1], [2, 0], dark.main, 0.075, "inset"),

  navbarBoxShadow: `${boxShadow([0, 0], [1, 1], white.main, 0.9, "inset")}, ${boxShadow(
    [0, 20],
    [27, 0],
    dark.main,
    0.05
  )}`,

  sliderBoxShadow: {
    thumb: boxShadow([0, 1], [13, 0], dark.main, 0.2),
  },

  colored: {
    info: `${boxShadow([0, 4], [20, 0], gradients.info?.main || "#0288d1", 0.14)}, ${boxShadow(
      [0, 7],
      [10, -5],
      gradients.info?.state || "#01579b",
      0.4
    )}`,
  },

  tabsBoxShadow: {
    indicator: tabs?.indicator?.boxShadow || "#ff6f00", // fallback si tabs o indicator no existe
  },
};

export default boxShadows;
