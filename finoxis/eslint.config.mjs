import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Product/seller images come from arbitrary external CDNs and local uploads,
      // so plain <img> is used intentionally instead of next/image.
      '@next/next/no-img-element': 'off',

      // The views were ported 1:1 from the old Vite app. These React Compiler / style rules flag
      // pre-existing patterns (setState in effects, functions used before declaration in effects,
      // apostrophes in JSX text). They are not runtime bugs, so report them as warnings for now.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'uploads/**']),
]);
