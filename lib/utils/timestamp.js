/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const loadNs = process.hrtime();
const loadUs = new Date().getTime() * 1e3;

const microseconds = () => {
    const diffNs = process.hrtime(loadNs);
    return loadUs + ((diffNs[0] * 1e6) + (diffNs[1] / 1e3));
};

export default microseconds;
