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

import core from 'nrfconnect/core';
import path from 'path';
import Datastore from 'nedb';

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
