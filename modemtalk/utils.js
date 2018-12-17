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

const simpleRangeToArray = range => {
    const [a, b] = range.split('-');
    if (!a || !b) {
        return [];
    }
    const [an, bn] = [parseInt(a, 10), parseInt(b, 10)];
    const [A, B] = [Math.min(an, bn), Math.max(an, bn)];
    return Array((B - A) + 1).fill(1).map((v, i) => (A + i));
};

// convert "1,3-4,7-10,12" => [1,3,4,7,8,9,10,12]
export const rangeToArray = range => {
    const a = [];
    range.split(',').forEach(v => {
        if (v.includes('-')) {
            a.push(...simpleRangeToArray(v));
        } else {
            a.push(parseInt(v, 10));
        }
    });
    return a;
};

export const matchAnything = /.*/;
export const lastLine = lines => lines.pop();

export const arrayParseInt = (arr, radix = 10) => {
    const a = arr;
    a.forEach((v, i) => {
        const newValue = parseInt(v, radix);
        a[i] = isNaN(newValue) ? undefined : newValue;
    });
    return a;
};

const EventCategory = category => EventCategory[category];

EventCategory.UNDEFINED = 0;
EventCategory.EVENT = 1;
EventCategory.ERROR = 2;
EventCategory.NETWORK = 3;
EventCategory.NETWORK_ERROR = 4;
EventCategory.PACKET_DOMAIN = 5;
EventCategory.PACKET_DOMAIN_ERRROR = 6;
EventCategory.MAX = 6;

Object.assign(EventCategory, {
    [EventCategory.EVENT]: 'Event',
    [EventCategory.ERROR]: 'Error',
    [EventCategory.NETWORK]: 'Network',
    [EventCategory.NETWORK_ERROR]: 'Network Error',
    [EventCategory.PACKET_DOMAIN]: 'Packetdomain',
    [EventCategory.PACKET_DOMAIN_ERRROR]: 'Packetdomain Error',
    [EventCategory.UNDEFINED]: 'Unspecified',
});

export { EventCategory };
