'use strict';

/**
 * engine-family router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::engine-family.engine-family');
