import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@common': path.resolve(__dirname, './src/common'),
            '@components': path.resolve(__dirname, './src/components'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@context': path.resolve(__dirname, './src/context'),
            '@types': path.resolve(__dirname, './src/types'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@layout': path.resolve(__dirname, './src/layout'),
            '@navigation': path.resolve(__dirname, './src/navigation'),
            '@routes': path.resolve(__dirname, './src/routes'),
        },
    },
    plugins: [react()],
});
