'use strict';

/**
 * steering service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::steering.steering');
