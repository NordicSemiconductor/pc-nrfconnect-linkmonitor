/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const config = require('pc-nrfconnect-shared/config/webpack.config');

const wrapper =
    process.platform === 'win32'
        ? (a, b) => {
              const conf = config(a, b);
              conf.module.rules[0].use[0].options.configFile =
                  './babel.config.js';
              return conf;
          }
        : config;

module.exports = wrapper;
