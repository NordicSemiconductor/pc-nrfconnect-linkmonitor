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

import fs from 'fs';
import { remote } from 'electron';
import { logger, getAppLogDir } from 'nrfconnect/core';
import { ResponseConverters } from 'modemtalk';
import {
    clearChart, addEventToChart, chartWindow, chartUpdate,
} from './chartActions';
import { decode } from '../utils/hexEscape';

export default function openLogfile() {
    return async dispatch => {
        const [filename] = remote.dialog.showOpenDialog({
            defaultPath: getAppLogDir(),
            properties: ['openFile'],
        }) || [];
        if (!filename) {
            return;
        }

        logger.info(`Restoring from ${filename}`);
        dispatch(clearChart());

        const contents = fs.readFileSync(filename, 'utf8');
        const rx = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) [^<]*<< (.*)/;
        let timestamp;
        let firstTimestamp;
        contents.split('\n').forEach(line => {
            const r = rx.exec(decode(line));
            if (r) {
                const [, t, cmd] = r;
                const pfx = cmd.slice(0, cmd.indexOf(':'));
                const cb = ResponseConverters[pfx];
                if (cb) {
                    const event = cb(line);
                    if (event) {
                        timestamp = (new Date(t).getTime()) * 1e3;
                        if (typeof firstTimestamp === 'undefined') {
                            firstTimestamp = timestamp;
                        }
                        addEventToChart(dispatch, event, timestamp);
                    }
                }
            }
        });
        if (timestamp) {
            dispatch(chartWindow(firstTimestamp, timestamp));
            dispatch(chartUpdate(timestamp));
        }
    };
}
