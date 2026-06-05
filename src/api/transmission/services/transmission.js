'use strict';

/**
 * transmission service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::transmission.transmission');
