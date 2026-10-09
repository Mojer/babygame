import { defineConfig } from 'vite';
import { stripSourceAssets } from './build/strip-source-assets.mjs';

export default defineConfig({ base: './', plugins: [stripSourceAssets()] });
