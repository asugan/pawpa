import { Theme } from "./types";
import { lightColors, darkColors, lightGradients, darkGradients } from "./colors";
import { fonts } from "./fonts";

export const lightTheme: Theme = {
  mode: "light",
  dark: false,
  colors: lightColors,
  fonts,
  gradients: lightGradients,
  roundness: 20, // Softer, more candy-like corners
};

export const darkTheme: Theme = {
  mode: "dark",
  dark: true,
  colors: darkColors,
  fonts,
  gradients: darkGradients,
  roundness: 20, // Softer, more candy-like corners
};
