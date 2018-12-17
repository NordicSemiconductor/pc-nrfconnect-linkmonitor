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

import { EventCategory } from '../utils';

const expect = /%XDRX: ?([0-9]+)/;

const DRXTable = {
    0: 'No DRX',
    1: '0.32 seconds DRX cycle parameter T = 32',
    2: '0.64 seconds DRX cycle parameter T = 64',
    3: '1.28 seconds DRX cycle parameter T = 128',
    4: '2.56 seconds DRX cycle parameter T = 256',
    5: '5.12 seconds E-UTRAN eDRX cycle length',
    6: '10.24 seconds E-UTRAN eDRX cycle length',
    7: '20.48 seconds E-UTRAN eDRX cycle length',
    8: '40.96 seconds E-UTRAN eDRX cycle length',
    9: '81.92 seconds E-UTRAN eDRX cycle length',
    10: '163.84 seconds E-UTRAN eDRX cycle length',
    11: '327.68 seconds E-UTRAN eDRX cycle length',
    12: '655.36 seconds E-UTRAN eDRX cycle length',
    13: '1310.72 seconds E-UTRAN eDRX cycle length',
    14: '2621.44 seconds E-UTRAN eDRX cycle length',
    255: 'DRX value not specified by the MS',
};

function convertResponse(resp) {
    const drxCycle = expect.exec(resp)[1];
    if (drxCycle) {
        return {
            id: 'drxCycle',
            value: parseInt(drxCycle, 10),
            message: DRXTable[drxCycle],
            category: EventCategory.NETWORK,
        };
    }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('%XDRX', convertResponse);

    Object.assign(target.prototype, {
        setDrxCycle(drxCycle) {
            return this.writeAT(`%XDRX=${drxCycle}`)
                .catch(err => Promise.reject(new Error(`setDrxCycle() failed: ${err.message}`)));
        },
        getDrxCycle() {
            return this.writeAT('%XDRX?', {
                expect,
                processor: lines => convertResponse(lines.pop()),
            })
                .catch(err => Promise.reject(new Error(`getDrxCycle() failed: ${err.message}`)));
        },
    });
};
