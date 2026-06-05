'use strict';

/**
 * technical-spec service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::technical-spec.technical-spec');
