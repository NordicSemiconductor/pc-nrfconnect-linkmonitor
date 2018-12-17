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

import { rangeToArray, EventCategory } from '../utils';

const ErrorReporting = {
    DISABLED: 0,
    NUMERIC: 1,
    VERBOSE: 2,
};

const expectExtendedErrorReport = /\+CEER: ?(.*)/;
const convertResponse = resp => {
    const r = expectExtendedErrorReport.exec(resp);
    if (r) {
        const [, message] = r;
        return {
            id: 'extendedErrorReport',
            message,
            category: EventCategory.ERROR,
        };
    }
    return undefined;
};

const ErrorCodes = {
    CME: {
        // 3GPP TS 27.007 Ch. 9.2
        0: 'phone failure',
        1: 'no connection to phone',
        2: 'phone adaptor link reserved',
        3: 'operation not allowed',
        4: 'operation not supported',
        5: 'PH SIM PIN required',
        6: 'PH-FSIM PIN required',
        7: 'PH-FSIM PUK required',
        10: 'SIM not inserted',
        11: 'SIM PIN required',
        12: 'SIM PUK required',
        13: 'SIM failure',
        14: 'SIM busy',
        15: 'SIM wrong',
        16: 'incorrect password',
        17: 'SIM PIN2 required',
        18: 'SIM PUK2 required',
        20: 'memory full',
        21: 'invalid index',
        22: 'not found',
        23: 'memory failure',
        24: 'text string too long',
        25: 'invalid characters in text string',
        26: 'dial string too long',
        27: 'invalid characters in dial string',
        30: 'no network service',
        31: 'network timeout',
        32: 'network not allowed - emergency calls only',
        40: 'network personalization PIN required',
        41: 'network personalization PUK required',
        42: 'network subset personalization PIN required',
        43: 'network subset personalization PUK required',
        44: 'service provider personalization PIN required',
        45: 'service provider personalization PUK required',
        46: 'corporate personalization PIN required',
        47: 'corporate personalization PUK required',
        48: 'hidden key required',
        49: 'EAP method not supported',
        50: 'Incorrect parameters',
        51: 'command implemented but currently disabled',
        52: 'command aborted by user',
        53: 'not attached to network due to MT functionality restrictions',
        54: 'modem not allowed - MT restricted to emergency calls only',
        55: 'operation not allowed because of MT functionality restrictions',
        56: 'fixed dial number only allowed - called number is not a fixed dial number',
        57: 'temporarily out of service due to other MT usage',
        58: 'language/alphabet not supported',
        59: 'unexpected data value',
        60: 'system failure',
        61: 'data missing',
        62: 'call barred',
        63: 'message waiting indication subscription failure',
        100: 'unknown',

        103: 'Illegal MS',
        106: 'Illegal ME',
        107: 'GPRS services not allowed',
        108: 'GPRS services and non-GPRS services not allowed',
        111: 'PLMN not allowed',
        112: 'Location area not allowed',
        113: 'Roaming not allowed in this location area',
        114: 'GPRS services not allowed in this PLMN',
        115: 'No Suitable Cells In Location Area',
        122: 'Congestion',
        125: 'Not authorized for this CSG',
        172: 'Semantically incorrect message',
        173: 'Mandatory information element error',
        174: 'Information element non-existent or not implemented',
        175: 'Conditional IE error',
        176: 'Protocol error, unspecified',

        177: 'Operator Determined Barring',
        126: 'insufficient resources',
        127: 'missing or unknown APN',
        128: 'unknown PDP address or PDP type',
        129: 'user authentication failed',
        130: 'activation rejected by GGSN, Serving GW or PDN GW',
        131: 'activation rejected, unspecified',
        132: 'service option not supported',
        133: 'requested service option not subscribed',
        134: 'service option temporarily out of order',
        140: 'feature not supported',
        141: 'semantic error in the TFT operation',
        142: 'syntactical error in the TFT operation',
        143: 'unknown PDP context',
        144: 'semantic errors in packet filter(s)',
        145: 'syntactical errors in packet filter(s)',
        146: 'PDP context without TFT already activated',
        149: 'PDP authentication failure',
        178: 'maximum number of PDP contexts reached',
        179: 'requested APN not supported in current RAT and PLMN combination',
        180: 'request rejected, Bearer Control Mode violation',
        181: 'unsupported QCI value',
        171: 'Last PDN disconnection not allowed',
        148: 'unspecified GPRS error',
        150: 'invalid mobile class',
        182: 'user data transmission via control plane is congested',
        151: 'VBS/VGCS not supported by the network',
        152: 'No service subscription on SIM',
        153: 'No subscription for group ID',
        154: 'Group Id not activated on SIM',
        155: 'No matching notification',
        156: 'VBS/VGCS call already present',
        157: 'Congestion',
        158: 'Network failure',
        159: 'Uplink busy',
        160: 'No access rights for SIM file',
        161: 'No subscription for priority',
        162: 'operation not applicable or not possible',
        163: 'Group Id prefixes not supported',
        164: 'Group Id prefixes not usable for VBS',
        165: 'Group Id prefix value invalid',
    },

    CMS: {
        // 3GPP TS 24.011 clause E.2
        1: 'Unassigned (unallocated) number',
        8: 'Operator determined barring',
        10: 'Call barred',
        21: 'Short message transfer rejected',
        27: 'Destination out of service',
        28: 'Unidentified subscriber',
        29: 'Facility rejected',
        30: 'Unknown subscriber',
        38: 'Network out of order',
        41: 'Temporary failure',
        42: 'Congestion',
        47: 'Resources unavailable, unspecified',
        50: 'Requested facility not subscribed',
        69: 'Requested facility not implemented',
        81: 'Invalid short message transfer reference value',
        95: 'Invalid message, unspecified',
        96: 'Invalid mandatory information',
        97: 'Message type non-existent or not implemented',
        98: 'Message not compatible with short message protocol state',
        99: 'Information element non-existent or not implemented',
        111: 'Protocol error, unspecified',
        127: 'Interworking, unspecified',

        // 3GPP TS 23.040 clause 9.2.3.22
        128: 'Telematic interworking not supported',
        129: 'Short message Type 0 not supported',
        130: 'Cannot replace short message',
        143: 'Unspecified TP-PID error',
        144: 'Data coding scheme (alphabet) not supported',
        145: 'Message class not supported',
        159: 'Unspecified TP-DCS error',
        160: 'Command cannot be actioned',
        161: 'Command unsupported',
        175: 'Unspecified TP-Command error',
        176: 'TPDU not supported',
        192: 'SC busy',
        193: 'No SC subscription',
        194: 'SC system failure',
        195: 'Invalid SME address',
        196: 'Destination SME barred',
        197: 'SM Rejected-Duplicate SM',
        198: 'TP-VPF not supported',
        199: 'TP-VP not supported',
        208: '(U)SIM SMS storage full',
        209: 'No SMS storage capability in (U)SIM',
        210: 'Error in MS',
        211: 'Memory Capacity Exceeded',
        212: '(U)SIM Application Toolkit Busy',
        213: '(U)SIM data download error',
        255: 'Unspecified error cause',

        // 3GPP TS 27.005 Ch. 3.2.5
        300: 'ME failure',
        301: 'SMS service of ME reserved',
        302: 'operation not allowed',
        303: 'operation not supported',
        304: 'invalid PDU mode parameter',
        305: 'invalid text mode parameter',
        310: '(U)SIM not inserted',
        311: '(U)SIM PIN required',
        312: 'PH-(U)SIM PIN required',
        313: '(U)SIM failure',
        314: '(U)SIM busy',
        315: '(U)SIM wrong',
        316: '(U)SIM PUK required',
        317: '(U)SIM PIN2 required',
        318: '(U)SIM PUK2 required',
        320: 'memory failure',
        321: 'invalid memory index',
        322: 'memory full',
        330: 'SMSC address unknown',
        331: 'no network service',
        332: 'network timeout',
        340: 'no +CNMA acknowledgement expected',
        500: 'unknown error',

        // Vendor specific
        513: 'Not found, for read, write, and delete',
        514: 'No access, for read, write, and delete',
        515: 'Memory full, for write',
        518: 'Not allowed in active state',
    },
};

class ExtendedError extends Error {
    constructor(command, response) {
        if (response === 'ERROR') {
            super(`${command} failed`);
            return;
        }
        const rx = /\+(CME|CMS) ERROR: ?(.*)/;
        const match = rx.exec(response);
        if (match) {
            const [, type, msg] = match;
            const codemap = ErrorCodes[type];
            const code = parseInt(msg, 10);
            const message = (code.toString() === msg)
                ? codemap[code] || 'Unknown error code'
                : msg;
            super(`${command} failed: ${message}`);
            this.code = code;
        } else {
            super(`${command} failed: ${response}`);
        }
    }
}

module.exports = target => {
    target.prototype.registerConverter('+CEER', convertResponse);

    Object.assign(target.prototype, {
        ErrorReporting,
        ExtendedError,
        setErrorReporting(n) {
            return this.writeAT(`+CMEE=${n}`);
        },
        getErrorReporting() {
            const expect = /\+CMEE: ?(\d)/;
            return this.writeAT('+CMEE?', {
                expect,
                processor: lines => {
                    const mode = expect.exec(lines.pop())[1];
                    return ['disabled', 'numeric', 'verbose'][mode];
                },
            });
        },
        testErrorReporting() {
            const expect = /\+CMEE: ?\(([^)]*)\)/;
            return this.writeAT('+CMEE=?', {
                expect,
                processor: lines => rangeToArray(expect.exec(lines.pop())[1]),
            });
        },
        getExtendedErrorReport() {
            return this.writeAT('+CEER', {
                expect: expectExtendedErrorReport,
                processor: lines => convertResponse(lines.pop()),
            });
        },
    });
};
