'use strict';

/**
 * steering router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::steering.steering');
