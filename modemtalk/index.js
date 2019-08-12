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

import SerialPort from 'serialport';
import api from './api';

export { EventCategory } from './utils';

export const ResponseConverters = {};

const commandsWithoutPrefixedResponse = ['AT+CLAC', 'AT+CGSN', 'AT+CGMM', 'AT+CGMI', 'AT+CGMR'];

class ModemPort extends SerialPort {
    constructor(port, opts) {
        super(port, {
            autoOpen: false,
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            rtscts: true,
        });
        this.requestQueue = [];
        this.busy = false;
        this.modemBits = [null, null, null];
        this.defaults = {
            delayBetweenCommands: 20,
            timeout: 1000,
            nullTerminated: false,
            writeCallback: null,
            flagCheckInterval: 100,
        };
        this.setDefaultOptions(opts);
        const delim = /["\r\n\0]+/;
        this.last = '';
        this.on('data', buffer => {
            let data = this.last + buffer.toString('binary');
            this.last = '';
            const parts = [];
            let i = -1;
            let j;
            do {
                j = data.slice(i + 1).search(delim);
                if (j === -1) {
                    // no delimiter, wait for more
                    this.last = data;
                    break;
                } else {
                    i += j + 1;
                    if (data[i] === '"') {
                        j = data.slice(i + 1).indexOf('"');
                        if (j === -1) {
                            // only one quote, waiting for the next
                            this.last = data;
                            break;
                        } else {
                            i += j + 1;
                        }
                    } else {
                        while (['\r', '\n', '\0'].includes(data[i])) {
                            i += 1;
                        }
                        parts.push(data.slice(0, i));
                        data = data.slice(i);
                        i = -1;
                    }
                }
            } while (data && data.length > 0);

            parts.forEach(part => {
                if (this.handler) {
                    this.handler(part);
                } else {
                    const line = part.toString().replace(/\0$/, '').trim();
                    if (line) {
                        this.emit('rx', part, true);
                        this.emit('_unsolicited', line);
                    }
                }
            });
        });
    }

    open() {
        return new Promise((resolve, reject) => {
            super.open(err => {
                if (err) {
                    reject(new Error(err.message || err));
                    return;
                }
                this.on('_unsolicited', line => {
                    const pfx = line.slice(0, line.indexOf(':'));
                    const cb = ResponseConverters[pfx];
                    if (cb) {
                        const r = cb(line);
                        if (r) {
                            this.emit('event', r);
                        }
                    }
                });

                this.flagCheckInterval = setInterval(() => {
                    this.get((error, status) => {
                        if (error) {
                            clearInterval(this.flagCheckInterval);
                            this.modemBits = [null, null, null];
                            return;
                        }
                        const [cts, dsr, dcd] = this.modemBits;
                        if (cts !== status.cts || dsr !== status.dsr || dcd !== status.dcd) {
                            this.modemBits = [status.cts, status.dsr, status.dcd];
                            this.emit('modemBits', status);
                        }
                    });
                }, this.defaults.flagCheckInterval);
                resolve();
            });
        });
    }

    setDefaultOptions(opts) {
        this.defaults = { ...this.defaults, ...opts };
        this.eol = this.defaults.nullTerminated ? '\0' : '\r\n';
    }

    write(...args) {
        if (this.defaults.writeCallback) {
            this.defaults.writeCallback(...args);
        }

        const writeLine = (lines, cb) => {
            const [line, ...rest] = lines;
            super.write(line, err => {
                if (err) {
                    cb(err);
                } else if (rest.length) {
                    setTimeout(() => {
                        super.drain(() => writeLine(rest, cb));
                    }, 10);
                } else {
                    super.drain(cb);
                }
            });
        };
        const lines = ([]).concat(...args.map(a => (
            (typeof a === 'string') ? a.split('\n') : a
        ))).filter(a => a.length);
        const callback = lines.pop();

        writeLine(lines, callback);
    }

    writeCommand(command, options) {
        setTimeout(this.resolveNext.bind(this), this.delayBetweenCommands);
        return new Promise((resolve, reject) => {
            this.requestQueue.unshift({
                command, options, resolve, reject,
            });
        });
    }

    resolveNext() {
        if (!this.requestQueue.length) return;
        if (this.busy) return;
        this.busy = true;
        const {
            command, options, resolve, reject,
        } = this.requestQueue.pop();
        this.resolveCommand(command, options)
            .then(result => {
                this.busy = false;
                setTimeout(this.resolveNext.bind(this), this.delayBetweenCommands);
                resolve(result);
            })
            .catch(error => {
                this.busy = false;
                setTimeout(this.resolveNext.bind(this), this.delayBetweenCommands);
                reject(new Error(error));
            });
    }

    resolveCommand(command, options) {
        const defaultOptions = { timeout: this.defaults.timeout };
        const { expect, processor, timeout } = { ...defaultOptions, ...options };

        return new Promise((resolve, reject) => {
            const lines = [];

            const t = setTimeout(() => {
                this.handler = null;
                this.last = '';
                reject(new Error(`'${command}' timed out`));
            }, timeout);

            const startOfCommand = command.split(/[?:=]/).shift().trim();
            this.handler = part => {
                const line = part.toString().replace(/\0$/, '').trim();
                const startOfLine = line.split(':').shift();

                let solicited;
                if (expect) {
                    solicited = expect.test(line);
                } else if (startOfCommand === `AT${startOfLine}`) {
                    solicited = true;
                } else {
                    solicited = commandsWithoutPrefixedResponse.includes(startOfCommand);
                }

                clearTimeout(t);
                switch (startOfLine) {
                    case 'OK':
                        this.emit('rx', part);
                        this.handler = null;
                        if (processor && lines.length > 0) {
                            resolve(processor(lines));
                        } else if (lines.length > 0) {
                            resolve(lines);
                        } else {
                            resolve();
                        }
                        return;

                    case 'ERROR':
                    case '+CME ERROR':
                    case '+CMS ERROR': {
                        this.emit('rx', part);
                        this.handler = null;
                        reject(new this.ExtendedError(command, line));
                        return;
                    }
                    default:
                }
                if (!lines.length && command.startsWith(line)) {
                    // skipping echo
                    return;
                }

                this.emit('rx', part, !solicited);
                if (line.length > 0) {
                    if (expect) {
                        lines.push(line);
                    } else {
                        this.emit('_unsolicited', line);
                    }
                }
            };

            this.write(command, err => {
                if (err) {
                    reject(new Error(err.message || err));
                }
            });
        });
    }

    writeAT(command, options) {
        return this.writeCommand(`AT${command}${this.eol}`, options);
    }
}

ModemPort.prototype.registerConverter = (key, converter) => {
    if (Array.isArray(key)) {
        key.forEach(k => ModemPort.prototype.registerConverter(k, converter));
        return;
    }
    if (ResponseConverters[key]) {
        throw new Error(`Converter for '${key}' is already registered.`);
    }
    if (typeof converter !== 'function') {
        throw new Error(`Expected converter argument as function for '${key}'.`);
    }
    ResponseConverters[key] = converter;
};

api(ModemPort);

export default ModemPort;
