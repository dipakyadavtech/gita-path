// Creates services/cms/.env from .env.example with fresh random secrets. Safe to re-run: never overwrites.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = path.join(__dirname, '..');
const target = path.join(dir, '.env');
if (fs.existsSync(target)) {
  console.log('.env already exists — leaving it unchanged.');
  process.exit(0);
}
const rand = () => crypto.randomBytes(16).toString('base64');
const fill = {
  APP_KEYS: [rand(), rand(), rand(), rand()].join(','),
  API_TOKEN_SALT: rand(),
  ADMIN_JWT_SECRET: rand(),
  TRANSFER_TOKEN_SALT: rand(),
  JWT_SECRET: rand(),
  ENCRYPTION_KEY: rand(),
};
const out = fs
  .readFileSync(path.join(dir, '.env.example'), 'utf8')
  .split('\n')
  .map((line) => {
    const key = line.split('=')[0];
    return fill[key] !== undefined && line === `${key}=` ? `${key}=${fill[key]}` : line;
  })
  .join('\n');
fs.writeFileSync(target, out);
console.log('Created services/cms/.env with new secrets.');
