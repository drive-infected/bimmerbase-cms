'use strict';

/**
 * engine-version router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::engine-version.engine-version');
