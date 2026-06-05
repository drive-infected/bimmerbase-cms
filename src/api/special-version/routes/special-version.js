'use strict';

/**
 * special-version router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::special-version.special-version');
