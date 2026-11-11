// Copies the shared seed content into the app so demo mode works offline.
import { cpSync, mkdirSync } from 'node:fs';
const from = new URL('../../../packages/content/data/', import.meta.url);
const to = new URL('../src/content/', import.meta.url);
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log('Content synced to src/content');
