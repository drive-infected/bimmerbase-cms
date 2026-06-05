'use strict';

/**
 * transmission controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::transmission.transmission');
