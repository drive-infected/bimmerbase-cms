'use strict';

/**
 * steering controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::steering.steering');
