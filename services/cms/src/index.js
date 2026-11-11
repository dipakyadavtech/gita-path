'use strict';
const { publishGuard } = require('./lib/guard');
const { seed } = require('./lib/seed');

module.exports = {
  register({ strapi }) {
    strapi.documents.use(publishGuard(strapi));
  },
  async bootstrap({ strapi }) {
    await seed(strapi);
  },
};
