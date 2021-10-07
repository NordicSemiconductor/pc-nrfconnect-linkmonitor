/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line no-control-regex
const rxControlChars1 = /[\u0000-\u001F\u007F]/g;
const rxControlChars2 = /\\x([0-9A-Fa-f]{2})/g;

export const encode = data =>
    data
        .toString()
        .replace(
            rxControlChars1,
            match =>
                `\\x${`0${match.charCodeAt().toString(16)}`
                    .slice(-2)
                    .toUpperCase()}`
        );

export const decode = data =>
    data
        .toString()
        .replace(rxControlChars2, (match, code) =>
            String.fromCharCode(parseInt(code, 16))
        );

export const remove = data => data.toString().replace(rxControlChars1, '');
