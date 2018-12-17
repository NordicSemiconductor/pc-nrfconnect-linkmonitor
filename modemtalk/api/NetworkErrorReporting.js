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

const NetworkErrorReporting = {
    DISABLED: 0,
    EMM: 8,
    ESM: 16,
    EMM_ESM: 24,
    0: 'disabled',
    8: 'ESM',
    16: 'EMM',
    24: 'EMM+ESM',
};

const ErrorCauseMap = {
    // 3GPP TS 24.301 [83] Table 9.9.3.9.1
    EMM: {
        0b00000010: 'IMSI unknown in HSS',
        0b00000011: 'Illegal UE',
        0b00000110: 'Illegal ME',
        0b00000111: 'EPS services not allowed',
        0b00001000: 'EPS services and non-EPS services not allowed',
        0b00001001: 'UE identity cannot be derived by the network',
        0b00001010: 'Implicitly detached',
        0b00001011: 'PLMN not allowed',
        0b00001100: 'Tracking Area not allowed',
        0b00001101: 'Roaming not allowed in this tracking area',
        0b00001110: 'EPS services not allowed in this PLMN',
        0b00001111: 'No Suitable Cells In tracking area',
        0b00010000: 'MSC temporarily not reachable',
        0b00010001: 'Network failure',
        0b00010010: 'CS domain not available',
        0b00010011: 'ESM failure',
        0b00010100: 'MAC failure',
        0b00010101: 'Synch failure',
        0b00010110: 'Congestion',
        0b00010111: 'UE security capabilities mismatch',
        0b00011000: 'Security mode rejected, unspecified',
        0b00011001: 'Not authorized for this CSG',
        0b00011010: 'Non-EPS authentication unacceptable',
        0b00100110: 'CS fallback call establishment not allowed',
        0b00100111: 'CS domain temporarily not available',
        0b00101000: 'No EPS bearer context activated',
        0b01011111: 'Semantically incorrect message',
        0b01100000: 'Invalid mandatory information',
        0b01100001: 'Message type non-existent or not implemented',
        0b01100010: 'Message type not compatible with the protocol state',
        0b01100011: 'Information element non-existent or not implemented',
        0b01100100: 'Conditional IE error',
        0b01100101: 'Message not compatible with the protocol state',
        0b01101111: 'Protocol error, unspecified',
    },
    // 3GPP TS 24.301 [83] Table 9.9.4.4.1
    ESM: {
        0b00001000: 'Operator Determined Barring',
        0b00011010: 'Insufficient resources',
        0b00011011: 'Unknown or missing APN',
        0b00011100: 'Unknown PDN type',
        0b00011101: 'User authentication failed',
        0b00011110: 'Activation rejected by Serving GW or PDN GW',
        0b00011111: 'Activation rejected, unspecified',
        0b00100000: 'Service option not supported',
        0b00100001: 'Requested service option not subscribed',
        0b00100010: 'Service option temporarily out of order',
        0b00100011: 'PTI already in use',
        0b00100100: 'Regular deactivation',
        0b00100101: 'EPS QoS not accepted',
        0b00100110: 'Network failure',
        0b00101000: 'Feature not supported',
        0b00101001: 'Semantic error in the TFT operation',
        0b00101010: 'Syntactical error in the TFT operation',
        0b00101011: 'Unknown EPS bearer context',
        0b00101100: 'Semantic errors in packet filter(s)',
        0b00101101: 'Syntactical errors in packet filter(s)',
        0b00101110: 'EPS bearer context without TFT already activated',
        0b00101111: 'PTI mismatch',
        0b00110001: 'Last PDN disconnection not allowed',
        0b00110010: 'PDN type IPv4 only allowed',
        0b00110011: 'PDN type IPv6 only allowed',
        0b00110100: 'Single address bearers only allowed',
        0b00110101: 'ESM information not received',
        0b00110110: 'PDN connection does not exist',
        0b00110111: 'Multiple PDN connections for a given APN not allowed',
        0b00111000: 'Collision with network initiated request',
        0b01010001: 'Invalid PTI value',
        0b01011111: 'Semantically incorrect message',
        0b01100000: 'Invalid mandatory information',
        0b01100001: 'Message type non-existent or not implemented',
        0b01100010: 'Message type not compatible with the protocol state',
        0b01100011: 'Information element non-existent or not implemented',
        0b01100100: 'Conditional IE error',
        0b01100101: 'Message not compatible with the protocol state',
        0b01101111: 'Protocol error, unspecified',
        0b01110000: 'APN restriction value incompatible with active EPS bearer context',
    },
};

const convertResponse = resp => {
    const rx = /\+CNEC_([^:]*): ?(\d+)(?:,(\d+))?/;
    const r = rx.exec(resp);
    if (r) {
        const [, domain, errorCode0, cid0] = r;
        const [errorCode, cid] = arrayParseInt([errorCode0, cid0]);
        const message = (ErrorCauseMap[domain] || {})[errorCode];
        return {
            id: 'networkError',
            domain,
            errorCode,
            cid,
            message,
            category: EventCategory.NETWORK_ERROR,
        };
    }
    return undefined;
};

module.exports = target => {
    target.prototype.registerConverter(['+CNEC_EMM', '+CNEC_ESM'], convertResponse);
    Object.assign(target.prototype, {
        NetworkErrorReporting,
        setNetworkErrorReporting(n) {
            return this.writeAT(`+CNEC=${n}`)
                .catch(err => Promise.reject(new Error(`setNetworkErrorReporting() failed: ${err.message}`)));
        },
        getNetworkErrorReporting() {
            return this.writeAT('+CNEC?', {
                expect: /\+CNEC: ?(\d)/,
                processor: lines => {
                    const mode = lines.pop().split(':').pop().trim();
                    return NetworkErrorReporting[mode];
                },
            })
                .catch(err => Promise.reject(new Error(`getNetworkErrorReporting() failed: ${err.message}`)));
        },
        testNetworkErrorReporting() {
            const expect = /\+CNEC: ?\(([^)]*)\)/;
            return this.writeAT('+CNEC=?', {
                expect,
                processor: lines => rangeToArray(expect.exec(lines.pop())[1]),
            })
                .catch(err => Promise.reject(new Error(`testNetworkErrorReporting() failed: ${err.message}`)));
        },
    });
};
