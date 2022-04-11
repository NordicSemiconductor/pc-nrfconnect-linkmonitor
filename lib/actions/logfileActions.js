/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from '@electron/remote';
import fs from 'fs';
import { ResponseConverters } from 'modemtalk';
import { getAppLogDir, logger } from 'pc-nrfconnect-shared';

import { decode } from '../utils/hexEscape';
import {
    addEventToChart,
    chartUpdate,
    chartWindow,
    clearChart,
} from './chartActions';

export default function openLogfile() {
    return async dispatch => {
        const {
            filePaths: [filename],
        } =
            (await dialog.showOpenDialog({
                defaultPath: getAppLogDir(),
                properties: ['openFile'],
            })) || [];

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
                        timestamp = new Date(t).getTime() * 1e3;
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
