'use strict';

/**
 * engine-version controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::engine-version.engine-version');
