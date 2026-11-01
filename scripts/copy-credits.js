import { copyFile } from 'node:fs/promises';
await copyFile('ASSETS.md', 'dist/ASSETS.md');
