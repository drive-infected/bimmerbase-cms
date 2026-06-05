'use strict';

/**
 * transmission router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::transmission.transmission');
