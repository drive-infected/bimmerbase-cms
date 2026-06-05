'use strict';

/**
 * special-version service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::special-version.special-version');
