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

import { rangeToArray, arrayParseInt } from '../utils';

const thresholds = [20, 40, 60, 80];

function getRssiThreshold(rsrp) {
    if (rsrp === 255) {
        return 0;
    }
    return thresholds.reduce((acc, cur) => (acc + ((rsrp > cur) ? 1 : 0)), 0);
}

function convertCESQUrc(resp) {
    const expect = /%CESQ: ?(\d+),(\d+)/;
    const [, rsrp, thresholdIndex] = arrayParseInt(expect.exec(resp));
    return {
        id: 'extendedSignalQuality',
        rsrp: (rsrp === 255) ? undefined : (-141 + rsrp),
        thresholdIndex,
    };
}

// linter rules require ** instead of Math.pow(), but ** is not supported by node v4.
/* eslint no-restricted-properties: off */

const expectCESQ = /\+CESQ: ?([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)/;
function convertCESQResponse(resp) {
    try {
        const [, rxlev, ber, rscp, ecno, rsrq, rsrp] = arrayParseInt(expectCESQ.exec(resp));
        const thresholdIndex = getRssiThreshold(rsrp);
        const rsrpTranslated = (rsrp === 255) ? undefined : (-141 + rsrp);
        return {
            id: 'extendedSignalQuality',
            rssi: (rxlev === 99) ? undefined : (-111 + rxlev),
            ber: (ber === 99) ? undefined : (Math.pow(2, ber)) / 10,
            rscp: (rscp === 255) ? undefined : (-121 + rscp),
            ecno: (ecno === 255) ? undefined : (-24.5 + (ecno / 2)),
            rsrq: (rsrq === 255) ? undefined : (-20 + (rsrq / 2)),
            rsrp: rsrpTranslated,
            thresholdIndex,
            message: `reference signal received power: ${rsrpTranslated} dBm`,
        };
    } catch (err) { /**/ }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('%CESQ', convertCESQUrc);
    target.prototype.registerConverter('+CESQ', convertCESQResponse);
    Object.assign(target.prototype, {
        getExtendedSignalQuality() {
            return this.writeAT('+CESQ', {
                expect: expectCESQ,
                processor: lines => convertCESQResponse(lines.pop()),
            })
                .catch(err => Promise.reject(new Error(`getExtendedSignalQuality() failed: ${err.message}`)));
        },
        testExtendedSignalQuality() {
            const expect = /\+CESQ: ?\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\),\(([^)]*)\)/;
            return this.writeAT('+CESQ=?', {
                expect,
                processor: lines => {
                    const [, rxlev, ber, rscp, ecno, rsrq, rsrp] = expect.exec(lines.pop());
                    return {
                        rxlev: rangeToArray(rxlev),
                        ber: rangeToArray(ber),
                        rscp: rangeToArray(rscp),
                        ecno: rangeToArray(ecno),
                        rsrq: rangeToArray(rsrq),
                        rsrp: rangeToArray(rsrp),
                    };
                },
            })
                .catch(err => Promise.reject(new Error(`testExtendedSignalQuality() failed: ${err.message}`)));
        },
        setSignalQualityNotification(enable) {
            return this.writeAT(`%CESQ=${enable ? 1 : 0}`);
        },
        setSignalQualityThreshold(rsrp1, rsrp2, rsrp3, rsrp4) {
            thresholds.splice(0, 4, rsrp1, rsrp2, rsrp3, rsrp4);
            return this.writeAT(`%CEST=${rsrp1},${rsrp2},${rsrp3},${rsrp4}`);
        },
    });
};
