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

const SerialPort = require('serialport');

const devName = process.argv.pop();
console.log(devName);

const testResponses = {
    '+CFUN': a => ((a !== '?') ? false : '+CFUN: 1'),
    '+CGMI': () => 'Nordic Semiconductor',
    '+CGMM': () => 'nRF9120',
    '+CGMR': () => 'mfw-m1_nrf9120.0.2.53-internal',
    '+CGSN': () => '004402990001137',
    '+CEMODE': a => ((a === '?') ? '+CEMODE: 0' : false),
    '+CIMI': () => false,
    '+CESQ': () => '+CESQ: 99,99,255,255,255,62',
    '%CESQ': () => true,
    '%XSIM': () => '%XSIM: 0',
    '%XCBAND': a => ((a === '=?') ? '%XCBAND: (1,2,3,4,12,13)' : '%XCBAND: 13'),
    '+CMEE': a => ((a === '?') ? '+CMEE: 1' : true),
    '+CNEC': a => ((a === '?') ? '+CNEC: 24' : true),
    '+CGEREP': a => ((a === '?') ? '+CGEREP: 1,0' : true),
    '+CIND': () => true,
    '+CEREG': () => true,
    '+COPS': a => {
        switch (a) {
            case '=?': return '+COPS: (2,"","","26201"),(1,"","","26202")';
            case '?': return '+COPS: 0,2,"26201"';
            default: return false;
        }
    },
};


async function main() {
    const port = new SerialPort(devName, {
        autoOpen: false,
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: true,
    });


    port.writeAndDrain = data => new Promise(resolve => {
        port.write(data, () => {
            console.log(`>> ${data}`);
            port.drain(resolve);
        });
    });

    await new Promise(resolve => {
        port.open(error => {
            if (error) {
                console.log(error.message, '\n\nUsage:  node nullmodem-tester.js port');
                process.exit(1);
            }
            resolve();
        });
    });

    let busy = false;
    let last = '';
    const eol = /[\r\n\0]+/;
    port.on('data', buffer => {
        const data = last + buffer.toString('binary');
        const parts = data.split(eol);
        if (!eol.test(data[data.length - 1])) {
            last = parts.pop();
        } else {
            last = '';
        }
        busy = true;
        Promise.all(parts.map(async part => {
            const line = part.trim();
            const match = /AT([^?=]+)(.*)/.exec(line);
            if (match) {
                const [, cmd, rest] = match;
                console.log(`<< AT${cmd}${rest}`);
                const responseFunction = testResponses[cmd];
                if (responseFunction) {
                    const response = responseFunction(rest);
                    if (response === false) {
                        await port.writeAndDrain('ERROR\r');
                    } else if (response === true) {
                        await port.writeAndDrain('OK\r');
                    } else {
                        await port.writeAndDrain(`${response}\rOK\r`);
                    }
                }
            }
        })).then(() => {
            busy = false;
        });
    });

    let [cts, dsr, dcd] = [false, false, false];
    setInterval(() => {
        port.get((error, status) => {
            if (error) {
                console.log('modemBits error: ', error);
                return;
            }
            if (cts !== status.cts || dsr !== status.dsr || dcd !== status.dcd) {
                [cts, dsr, dcd] = [status.cts, status.dsr, status.dcd];
                console.log('connection:', status);
            }
        });
    }, 500);

    setInterval(() => {
        if (!busy) {
            port.write('+CEREG: 1,"002F","0012BEEF",7\r');
        }
    }, 5000);
}

try {
    main();
} catch (err) {
    console.log(err);
}
