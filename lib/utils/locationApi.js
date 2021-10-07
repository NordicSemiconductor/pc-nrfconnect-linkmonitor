/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import Datastore from 'nedb';

// hosted modules from core must be loaded by require() if used at load time,
// due to webpack changes result in undefined object for imports
const core = require('nrfconnect/core');

const db = new Datastore({
    filename: path.join(core.getUserDataDir(), 'locationApi.db'),
    autoload: true,
});

const getLocation = (cellinfo, mccmnc, token) => (
    new Promise((resolve, reject) => {
        if (!token) {
            reject(new Error('Invalid getLocation request'));
            return;
        }
        if (!mccmnc || mccmnc.length < 5) {
            reject();
            return;
        }
        const { tac: lac, ci: cid } = cellinfo;
        const mcc = parseInt(mccmnc.substring(0, 3), 10);
        const mnc = parseInt(mccmnc.substring(3), 10);
        db.findOne({ lac, cid }, (err, doc) => {
            if (err) {
                reject(err);
                return;
            }
            if (doc === null) {
                const headers = new Headers();
                headers.set('Content-Type', 'application/json');

                fetch(new Request('https://eu1.unwiredlabs.com/v2/process.php', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        token,
                        radio: 'lte',
                        mcc,
                        mnc,
                        cells: [{ lac, cid }],
                        address: 1,
                    }),
                }))
                    .then(response => response.json())
                    .then(location => {
                        const obj = {
                            ...location,
                            lac,
                            cid,
                        };
                        db.insert(obj, (errr, newDoc) => {
                            if (errr) {
                                reject(errr);
                                return;
                            }
                            resolve(newDoc);
                        });
                    })
                    .catch(reject);
                return;
            }
            resolve(doc);
        });
    })
);

export default getLocation;
