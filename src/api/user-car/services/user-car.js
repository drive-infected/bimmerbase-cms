'use strict';

/**
 * user-car service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-car.user-car');
