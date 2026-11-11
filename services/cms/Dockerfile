# Build context: repo root (the first start imports packages/content)
FROM node:22-bookworm-slim
WORKDIR /srv/services/cms
COPY packages/content /srv/packages/content
COPY services/cms/package.json services/cms/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY services/cms ./
ENV NODE_ENV=production
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "start"]
