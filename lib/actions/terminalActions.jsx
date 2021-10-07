/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ResponseConverters } from 'modemtalk';

import TerminalView from '../components/TerminalView';
import { UPDATE_SAVED_COMMANDS, UPDATE_TERMINAL } from './actionIds';
import persistentStore from './persistentStore';

const { contentBuffer } = TerminalView;

const C0controls = [
    'NUL',
    'SOH',
    'STX',
    'ETX',
    'EOT',
    'ENQ',
    'ACK',
    'BEL',
    'BS',
    'TAB',
    'LF',
    'VT',
    'FF',
    'CR',
    'SO',
    'SI',
    'DLE',
    'DC1',
    'DC2',
    'DC3',
    'DC4',
    'NAK',
    'SYN',
    'ETB',
    'CAN',
    'EM',
    'SUB',
    'ESC',
    'FS',
    'GS',
    'RS',
    'US',
];
C0controls[0x7f] = 'DEL';

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
                    out.push(
                        <pre
                            key={`.${out.length}`}
                            className={`ctrl-char ${
                                C0controls[c.charCodeAt()]
                            }`}
                        >
                            {c}
                        </pre>
                    );
                });
                str = str.substring(pre.length + ch.length);
            } else {
                out.push(<pre key={`.${out.length}`}>{str}</pre>);
                str = null;
            }
        }
        const timestamp = new Date().getTime();
        contentBuffer.push(
            <span key={timestamp} className={direction} title={event.message}>
                {out}
            </span>
        );
        if (contentBuffer.length > TERMINAL_CONTENT_MAX_LINES) {
            contentBuffer.splice(
                0,
                contentBuffer.length - TERMINAL_CONTENT_MAX_LINES
            );
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
            persistentStore.set(
                'commands',
                'AT|AT+CFUN?|AT+CFUN=1|||||||'.split('|')
            );
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
