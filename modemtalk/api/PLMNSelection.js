/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { arrayParseInt, EventCategory } from '../utils';

/* eslint import/no-webpack-loader-syntax: 0 */
const { filter } = require('shebang-loader!mcc-mnc-list');

const PLMNStat = {
    0: 'unknown',
    1: 'available',
    2: 'current',
    3: 'forbidden',
};

const PLMNMode = {
    AUTOMATIC: 0,
    MANUAL: 1,
    SET_FORMAT: 3,
    0: 'automatic',
    1: 'manual',
    2: 'deregistered',
};

const PLMNFormat = {
    LONG_ALPHA: 0,
    SHORT_ALPHA: 1,
    NUMERIC: 2,
};

const timeout = 60000;
const expect = /\+COPS: ?(?:(\(.*?\),?)+|(([0-2])(?:,([0-2]),"([^"]*)")?))/;

function convertResponse(resp) {
    const match = expect.exec(resp);
    if (!match) {
        return undefined;
    }
    if (match[1]) {
        const result = {};
        const rx = /(\((\d),"([^"]*)","([^"]*)","([^"]*)"[^)]*\))+/g;
        const operators = [];
        for (;;) {
            const a = rx.exec(resp);
            if (a === null) break;
            const [,, stat,,, mccmnc] = a;
            const { operator } = (filter({ mccmnc })[0] || {});
            operators.push(operator);
            result[mccmnc] = {
                operator,
                stat: PLMNStat[stat],
            };
        }
        return {
            id: 'plmnSearch',
            result,
            message: `Available: ${operators.join(', ')}`,
            category: EventCategory.NETWORK,
        };
    }
    if (match[2]) {
        const [mode, format] = arrayParseInt([match[3], match[4]]);
        let mccmnc;
        let operator;
        if (format === 2) {
            ([,,,,, mccmnc] = match);
            ({ operator } = (filter({ mccmnc })[0] || {}));
        } else {
            ([,,,,, operator] = match);
        }
        const opmsg = operator ? `${operator} ` : '';
        return {
            id: 'plmn',
            selected: (mode < 2),
            mccmnc,
            operator,
            message: `${opmsg}[${PLMNMode[mode]}]`,
            category: EventCategory.NETWORK,
        };
    }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('+COPS', convertResponse);
    Object.assign(target.prototype, {
        PLMNMode,
        PLMNFormat,
        PLMNStat,
        setPLMNSelection(...args) {
            return this.writeAT(`+COPS=${args.join(',')}`, { timeout });
        },
        getPLMNSelection() {
            return this.writeAT('+COPS?', {
                timeout,
                expect,
                processor: lines => convertResponse(lines.pop()),
            });
        },
        testPLMNSelection() {
            return this.writeAT('+COPS=?', {
                timeout,
                expect,
                processor: lines => convertResponse(lines.pop()),
            });
        },
    });
};
