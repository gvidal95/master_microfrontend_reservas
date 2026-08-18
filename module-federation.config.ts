import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'reservas',

  exposes: {
    './App': './src/App.tsx',
  },

  shared: {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },
});