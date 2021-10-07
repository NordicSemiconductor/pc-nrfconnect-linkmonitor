/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

const persistentStore = new Store({ name: 'pc-nrfconnect-linkmonitor' });

export default persistentStore;
