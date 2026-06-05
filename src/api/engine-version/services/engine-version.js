'use strict';

/**
 * engine-version service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::engine-version.engine-version');
