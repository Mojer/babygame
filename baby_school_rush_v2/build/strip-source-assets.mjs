import { readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Production sources that live beside runtime art in public/ but must not ship with the game. */
const SOURCE_ONLY = [/\.blend1?$/i, /\.zip$/i, /\.py$/i, /^\.DS_Store$/, /^source-sheets$/];

/** Removes Blender files, archives, scripts and source sheets that Vite copied from public/. */
export function stripSourceAssets() {
  let outDir = 'dist';
  return {
    name: 'strip-source-assets',
    apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    closeBundle() {
      const walk = directory => {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const path = join(directory, entry.name);
          if (SOURCE_ONLY.some(pattern => pattern.test(entry.name))) rmSync(path, { recursive: true, force: true });
          else if (entry.isDirectory()) walk(path);
        }
      };
      walk(outDir);
    }
  };
}
