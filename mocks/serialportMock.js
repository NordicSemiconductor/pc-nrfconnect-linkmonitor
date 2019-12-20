import { EventEmitter } from 'events';

/* eslint class-methods-use-this: off */

export default class SerialPort extends EventEmitter {
    open(callback) {
        console.log('opening mocked serialport');
        callback();
    }

    drain(callback) {
        callback();
    }

    get() {}

    respond(...lines) {
        lines.forEach(line => this.emit('data', `${line}\0`));
    }

    write(cmd, ...params) {
        const callback = params.pop();
        callback();

        const rx = /AT([^=?]*)(=?\??)(.*?)/;

        const match = rx.exec(cmd.replace(/[\0\r\n]/g, ''));
        if (!match) return;

        const [, command, op] = match;
        if (typeof command === 'undefined') return;

        const RespMap = {
            '': { '': '' },
            '+CLAC': {
                '': 'LIST\nOF\nTEST\nCOMMANDS',
                '=?': '',
            },
            '+CMEE': {
                '=?': '+CMEE: (0,1)',
                '?': '+CMEE: 1',
                '=': '',
            },
            '+CNEC': {
                '=?': '+CNEC: (0,8,16,24)',
                '?': '+CNEC: 24',
                '=': '',
            },
            '+CGMI': { '': 'Manufacturer identifier' },
            '+CGMM': { '': 'Model identifier' },
            '+CGMR': { '': 'Revision identifier' },
            '+CGSN': { '': 'Serial number' },
            '+CIMI': { '': '34875023745792834' },
            '+XMER': {
                '=?': '+XMER: (0,1)',
                '?': '+XMER: 1',
                '=': '',
            },
            '+CGEREP': {
                '=?': '+CGEREP: (0,1),(0)',
                '?': '+CGEREP: 1,0',
                '=': '',
            },
            '+CFUN': {
                '?': '+CFUN: 1',
                '=': '',
            },
            '+COPS': {
                '=?': '+COPS: (2,"","","26201"),(1,"","","26202")',
                '?': '+COPS: 0,2,"26201"',
                '=': '',
            },
            '+CGDCONT': {
                '?': '+CGDCONT: 0,"IP","internet","10.0.1.1",0,0\n+CGDCONT: 1,"IP","IOT_apn","10.0.1.2",0,0',
                '=': '',
            },
            '+CEREG': {
                '=?': '+CEREG: (0-2)',
                '?': '+CEREG: 2,1,"002F","0012BEEF",7',
                '=': '',
            },
            '+CSQ': {
                '': '+CSQ: 99,99',
            },
            '+CESQ': {
                '': '+CESQ: 99,99,255,255,20,62',
                '=?': '+CESQ: (99),(99),(255),(255),(0-255),(0-255)',
            },
            '%NBRGRSRP': {
                '': '%NBRGRSRP: 4,5230,40,5,5230,39',
            },
        };

        const resp = (RespMap[command] || {})[op];
        setTimeout(() => {
            if (typeof resp === 'undefined') {
                this.respond('ERROR');
            } else {
                this.respond(...resp.split('\n'), 'OK');
            }
        }, 10);
    }

    close(callback) {
        console.log('closing mocked serialport');
        if (callback) {
            callback();
        }
    }
}
