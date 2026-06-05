'use strict';

/**
 * service-log service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::service-log.service-log');
