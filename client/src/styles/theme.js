import { extendTheme } from '@chakra-ui/react';

// Custom color palette
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#03a9f4', // Primary brand color
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
  secondary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
};

// Customize component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        overflow: 'hidden',
        boxShadow: 'sm',
      },
    },
  },
};

// Customize global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
  }),
};

// Typography
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};

// Create the theme
const theme = extendTheme({
  colors,
  components,
  styles,
  fonts,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;