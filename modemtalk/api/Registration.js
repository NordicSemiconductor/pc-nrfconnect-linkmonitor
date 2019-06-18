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

import { rangeToArray, arrayParseInt, EventCategory } from '../utils';

const Registration = {
    DISABLE: 0,
    ENABLE: 1,
    ENABLE_WITH_LOCATION: 2,
    ENABLE_WITH_LOCATION_AND_CAUSE: 3,
};

// +CEREG: [<n>,]<stat>[,<tac>,<ci>,<AcT>[,<cause_type>,<reject_cause>]]
const expect = /\+C([EG])REG: (?:(\d+),)?(\d+)(?:,"([0-9A-F]{1,4})","([0-9A-F]{1,8})"(?:,(\d)(?:,([^,]*),(.*))?)?)?/;

const Stat = {
    0: 'not registered',
    1: 'registered, home network',
    2: 'not registered, searching',
    3: 'registration denied',
    4: 'unknown',
    5: 'registered, roaming',
    8: 'emergency only',
    90: 'not registered due to UICC failure',
};

function convertResponse(resp) {
    const r = expect.exec(resp);
    if (r) {
        const [, d, n0, stat0, tac0, ci0, act0, causeType0, rejectCause0] = r;
        const [n, stat, AcT, causeType, rejectCause] = arrayParseInt(
            [n0, stat0, act0, causeType0, rejectCause0], 10,
        );
        const tac = parseInt(tac0, 16);
        const ci = parseInt(ci0, 16);
        const domain = { E: 'eps', G: 'gprs' }[d];
        return {
            id: 'registration',
            domain,
            n,
            stat,
            status: Stat[stat],
            tac,
            ci,
            AcT,
            causeType,
            rejectCause,
            category: EventCategory.NETWORK,
            message: `${domain.toUpperCase()} registration: ${Stat[stat]}`,
        };
    }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('+CEREG', convertResponse);
    Object.assign(target.prototype, {
        Registration,
        setEPSRegistration(n) {
            return this.writeAT(`+CEREG=${n}`)
                .catch(err => Promise.reject(new Error(`setEPSRegistration() failed: ${err.message}`)));
        },
        getEPSRegistration() {
            return this.writeAT('+CEREG?', {
                expect,
                processor: lines => convertResponse(lines.pop()),
            })
                .catch(err => Promise.reject(new Error(`getEPSRegistration() failed: ${err.message}`)));
        },
        testEPSRegistration() {
            const testExpect = /\+CEREG: ?\( ?([^)]*)\)/;
            return this.writeAT('+CEREG=?', {
                expect: testExpect,
                processor: lines => rangeToArray(testExpect.exec(lines.pop())[1]),
            })
                .catch(err => Promise.reject(new Error(`testEPSRegistration() failed: ${err.message}`)));
        },
    });
};
