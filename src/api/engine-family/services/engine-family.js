'use strict';

/**
 * engine-family service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::engine-family.engine-family');
