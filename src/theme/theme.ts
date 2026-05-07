import { createTheme, MantineColorsTuple } from '@mantine/core';

// If you want to change this array,
// please align also SCSS vars in _variables.scss
const orange: MantineColorsTuple = [
  '#FFF4E6',
  '#FFE8CC',
  '#FFD8A8',
  '#FFC078',
  '#FFA94D',
  '#FF922B',
  '#FD7E14',
  '#F76707',
  '#D8590C',
  '#D9480F',
];

// If you want to change this array,
// please align also SCSS vars in _variables.scss
const dark: MantineColorsTuple = [
  '#C1C2C5',
  '#A6A7AB',
  '#909296',
  '#5c5f66',
  '#373A40',
  '#2C2E33',
  '#25262B',
  '#1A1B1E',
  '#141517',
  '#0A0A0A',
];

export const theme = createTheme({
  autoContrast: true,
  luminanceThreshold: 0.38,
  primaryColor: 'orange',
  colors: {
    orange,
    dark,
  },
  black: '#0a0a0a',
  white: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  defaultRadius: 'md',
});
