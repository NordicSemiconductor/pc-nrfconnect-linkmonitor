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

const Functionality = {
    POWER_OFF: 0,
    NORMAL: 1,
    OFFLINE_MODE: 4,
    DISABLE_ATTACH: 10,
    ENABLE_ATTACH: 11,
    OFFLINE_MODE_UICC: 44,
    0: 'Power off',
    1: 'Normal',
    4: 'Offline mode',
    44: 'Offline mode without shutting down UICC',
};

const expect = /\+CFUN: ?([0-9]+)/;

function convertResponse(resp) {
    const match = expect.exec(resp);
    if (!match) {
        return undefined;
    }
    const [, fun] = match;
    if (!fun) {
        return undefined;
    }
    return {
        id: 'functionality',
        value: parseInt(fun, 10),
        translated: Functionality[fun],
        message: `Modem functionality ${Functionality[fun]}`,
        category: EventCategory.EVENT,
    };
}

module.exports = target => {
    target.prototype.registerConverter('+CFUN', convertResponse);

    Object.assign(target.prototype, {
        Functionality,
        setFunctionality(fun) {
            return this.writeAT(`+CFUN=${fun}`);
        },
        getFunctionality() {
            return this.writeAT('+CFUN?', {
                expect,
                processor: lines => convertResponse(lines.pop()),
            });
        },
    });
};
