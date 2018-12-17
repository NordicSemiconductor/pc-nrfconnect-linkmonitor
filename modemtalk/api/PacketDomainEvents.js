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

import { rangeToArray, EventCategory, arrayParseInt } from '../utils';

const PacketDomainEvents = {
    BUFFER: 0,
    DISCARD_THEN_FORWARD: 1,
};

const Origin = {
    NW: 'network',
    ME: 'mobile termination',
};

const convertResponse = resp => {
    const rx = /\+CGEV: ?(\w*) (IPV6|[A-Z ]*[A-Z])(?: (\d+)(?:,(\d+)(?:,(\d+))?)?)?/;

    // +CGEV: NW DETACH
    // +CGEV: ME DETACH
    // +CGEV: ME PDN ACT <cid>[,<reason>[,<cid_other>]]
    // +CGEV: NW PDN DEACT <cid>
    // +CGEV: ME PDN DEACT <cid>
    // +CGEV: NW ACT <p_cid>, <cid>, <event_type>
    // +CGEV: ME ACT <p_cid>, <cid>, <event_type>
    // +CGEV: NW DEACT <p_cid>, <cid>, <event_type>
    // +CGEV: ME DEACT <p_cid>, <cid>, <event_type>
    // +CGEV: NW MODIFY <cid>, <change_reason>, <event_type>
    // +CGEV: ME MODIFY <cid>, <change_reason>, <event_type>
    // +CGEV: IPV6 <cid>

    const PDNACTReason = [
        'IPv4 only allowed',
        'IPv6 only allowed',
        'single access bearers only allowed',
        'single address bearers only allowed and MT initiated context activation for a second address type bearer was not successful',
    ];

    const EventType = [
        'Informational',
        'Acknowledgement required',
    ];

    const ChangeReason = [
        '',
        'TFT',
        'QoS',
        'TFT+QoS',
        'WLANOffload',
        'TFT+WLANOffload',
        'QoS+WLANOffload',
        'TFT+QoS+WLANOffload',
    ];

    const r = rx.exec(resp);
    if (r) {
        const [, org, action, arg1, arg2, arg3] = r;
        const origin = Origin[org];
        const id = 'packetDomain';
        const category = EventCategory.PACKET_DOMAIN;
        switch (action) {
            case 'DETACH':
                return {
                    id,
                    origin,
                    action,
                    message: `${action} by ${origin}`,
                    category,
                };
            case 'PDN ACT': {
                const reasonMsg = PDNACTReason[arg2] ? `, reason: ${PDNACTReason[arg2]}` : '';
                const cidOtherMsg = arg3 ? `, cidOther: ${arg3}` : '';
                return {
                    id,
                    origin,
                    action,
                    cid: parseInt(arg1, 10),
                    reason: PDNACTReason[arg2],
                    cidOther: parseInt(arg3, 10),
                    message: `${action} by ${origin}, cid: ${arg1}${reasonMsg}${cidOtherMsg}`,
                    category,
                };
            }
            case 'PDN DEACT':
                return {
                    id,
                    origin,
                    action,
                    cid: parseInt(arg1, 10),
                    message: `${action} by ${origin}, cid: ${arg1}`,
                    category,
                };
            case 'ACT':
            case 'DEACT':
                return {
                    id,
                    origin,
                    action,
                    pCid: parseInt(arg1, 10),
                    cid: parseInt(arg2, 10),
                    eventType: EventType[arg3],
                    message: `${action} by ${origin}, pCid: ${arg1}, cid: ${arg2}, ${EventType[arg3]}`,
                    category,
                };
            case 'MODIFY':
                return {
                    id,
                    origin,
                    action,
                    cid: parseInt(arg1, 10),
                    changeReason: ChangeReason[arg2],
                    eventType: EventType[arg3],
                    message: `${action} by ${origin}, cid: ${arg1}, ${ChangeReason[arg2]} changed, ${EventType[arg3]}`,
                    category,
                };
            case 'IPV6':
                return {
                    id,
                    action,
                    cid: arg1,
                    message: `${action} Link up, cid: ${arg1}`,
                    category,
                };
            default:
        }
        return {
            id,
            action,
            message: `Unknown action: ${action}`,
            category,
        };
    }
    return undefined;
};

module.exports = target => {
    target.prototype.registerConverter('+CGEV', convertResponse);
    Object.assign(target.prototype, {
        PacketDomainEvents,
        setPacketDomainEvents(mode) {
            return this.writeAT(`+CGEREP=${mode}`)
                .catch(err => Promise.reject(new Error(`setPacketDomainEvents() failed: ${err.message}`)));
        },
        getPacketDomainEvents() {
            const expect = /\+CGEREP: ?([^,]*)(?:,(.*))?/;
            return this.writeAT('+CGEREP?', {
                expect,
                processor: lines => {
                    const r = expect.exec(lines.pop());
                    const [, mode, buf] = arrayParseInt(r);
                    return {
                        id: 'packetDomainEventReporting',
                        mode,
                        buf,
                    };
                },
            })
                .catch(err => Promise.reject(new Error(`getPacketDomainEvents() failed: ${err.message}`)));
        },
        testPacketDomainEvents() {
            const expect = /\+CGEREP: ?\(([^)]*)\),\(([^)]*)\)/;
            return this.writeAT('+CGEREP=?', {
                expect,
                processor: lines => {
                    const r = expect.exec(lines.pop());
                    const [, mode, buf] = r;
                    return {
                        id: 'packetDomainEventReporting',
                        mode: rangeToArray(mode),
                        buf: rangeToArray(buf),
                    };
                },
            })
                .catch(err => Promise.reject(new Error(`testPacketDomainEvents() failed: ${err.message}`)));
        },
    });
};
