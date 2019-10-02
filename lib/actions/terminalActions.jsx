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

import React from 'react';
import TerminalView from '../components/TerminalView';
import { UPDATE_TERMINAL, UPDATE_SAVED_COMMANDS } from './actionIds';
import { ResponseConverters } from 'modemtalk';
import persistentStore from './persistentStore';

const { contentBuffer } = TerminalView;

const C0controls = [
    'NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL',
    'BS', 'TAB', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI',
    'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB',
    'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US',
];
C0controls[0x7F] = 'DEL';

// eslint-disable-next-line no-control-regex
const ctrlChars = /(.*?)([\u0000-\u001F\u007F]+)/;
const TERMINAL_CONTENT_MAX_LINES = 4000;

function updateTerminalAction(update) {
    return {
        type: UPDATE_TERMINAL,
        update,
    };
}

function updateSavedCommandsAction(...commands) {
    return {
        type: UPDATE_SAVED_COMMANDS,
        commands,
    };
}

export function print(arg, direction, update = true) {
    return dispatch => {
        const out = [];
        let str = arg.toString();

        let event = {};
        if (direction !== 'tx') {
            const pfx = str.slice(0, str.indexOf(':'));
            const cb = ResponseConverters[pfx];
            if (cb) {
                event = cb(str) || {};
            }
        }

        while (str) {
            const match = ctrlChars.exec(str);
            if (match !== null) {
                const [, pre, ch] = match;
                if (pre.length > 0) {
                    out.push(<pre key={`.${out.length}`}>{pre}</pre>);
                }
                Array.from(ch).forEach(c => {
                    out.push(<pre key={`.${out.length}`} className={`ctrl-char ${C0controls[c.charCodeAt()]}`}>{c}</pre>);
                });
                str = str.substring(pre.length + ch.length);
            } else {
                out.push(<pre key={`.${out.length}`}>{str}</pre>);
                str = null;
            }
        }
        const timestamp = new Date().getTime();
        contentBuffer.push(
            <span key={timestamp} className={direction} title={event.message}>{out}</span>,
        );
        if (contentBuffer.length > TERMINAL_CONTENT_MAX_LINES) {
            contentBuffer.splice(0, contentBuffer.length - TERMINAL_CONTENT_MAX_LINES);
        }
        if (update) {
            dispatch(updateTerminalAction(timestamp));
        }
    };
}

export function printTX(arg) {
    return dispatch => {
        dispatch(print(arg, 'tx'));
    };
}

export function loadCommands() {
    return dispatch => {
        if (!persistentStore.has('commands')) {
            persistentStore.set('commands', 'AT|AT+CFUN?|AT+CFUN=1|||||||'.split('|'));
        }
        const commands = persistentStore.get('commands');
        dispatch(updateSavedCommandsAction(...commands));
    };
}

export function updateSavedCommands(...commands) {
    return dispatch => {
        persistentStore.set('commands', commands);
        dispatch(updateSavedCommandsAction(...commands));
    };
}
