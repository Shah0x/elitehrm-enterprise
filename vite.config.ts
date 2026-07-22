// // import tailwindcss from '@tailwindcss/vite';
// // import react from '@vitejs/plugin-react';
// // import path from 'path';
// // import {defineConfig, loadEnv} from 'vite';

// // export default defineConfig(({mode}) => {
// //   const env = loadEnv(mode, '.', '');
// //   return {
// //     plugins: [react(), tailwindcss()],
// //     define: {
// //       'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
// //     },
// //     resolve: {
// //       alias: {
// //         '@': path.resolve(__dirname, '.'),
// //       },
// //     },
// //     server: {
// //       // HMR is disabled in AI Studio via DISABLE_HMR env var.
// //       // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
// //       hmr: process.env.DISABLE_HMR !== 'true',
// //     },
// //   };
// // });

// import tailwindcss from '@tailwindcss/vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { defineConfig, loadEnv } from 'vite';

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, '.', '');
//   return {
//     plugins: [react(), tailwindcss()],
//     define: {
//       'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
//     },
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, '.'),
//       },
//     },
//     server: {
//       host: '0.0.0.0',
//       allowedHosts: true,
//       // If DISABLE_HMR is true, keep it false. Otherwise, route HMR WS through HTTPS proxy port 443
//       hmr: process.env.DISABLE_HMR === 'true' 
//         ? false 
//         : {
//             clientPort: 443,
//           },
//       watch: process.env.DISABLE_HMR === 'true' ? null : {},
//     },
//   };
// });
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      // If DISABLE_HMR is true, keep it false. Otherwise, route HMR WS through HTTPS proxy port 443
      hmr: process.env.DISABLE_HMR === 'true' 
        ? false 
        : {
            clientPort: 443,
          },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});