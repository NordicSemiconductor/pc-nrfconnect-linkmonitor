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

const ModesOfOperation = {
    PS_MODE_2: 0,
    CS_PS_MODE_1: 1,
    CS_PS_MODE_2: 2,
    PS_MODE_1: 3,
    0: 'PS mode 2',
    1: 'CS/PS mode 1',
    2: 'CS/PS mode 2',
    3: 'PS mode 1',
};

const expect = /\+CEMODE: ?([0-3]+)/;

function convertResponse(resp) {
    const mode = expect.exec(resp)[1];
    if (mode) {
        return {
            id: 'modeOfOperation',
            mode: parseInt(mode, 10),
            translated: ModesOfOperation[mode],
            message: `mode of operation: ${ModesOfOperation[mode]}`,
            category: EventCategory.EVENT,
        };
    }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('+CEMODE', convertResponse);

    Object.assign(target.prototype, {
        ModesOfOperation,
        setModeOfOperation(mode) {
            return this.writeAT(`+CEMODE=${mode}`)
                .catch(err => Promise.reject(new Error(`setModeOfOperation() failed: ${err.message}`)));
        },
        getModeOfOperation() {
            return this.writeAT('+CEMODE?', {
                expect,
                processor: lines => convertResponse(lines.pop()),
            })
                .catch(err => Promise.reject(new Error(`getModeOfOperation() failed: ${err.message}`)));
        },
    });
};
