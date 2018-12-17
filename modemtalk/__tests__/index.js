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

import ModemPort, { ResponseConverters } from '..';

const testCommands = [
    [
        'NON-EXISTING',
    ],
    [
        '+CFUN: 0',
        { category: 1, id: 'functionality', message: 'Modem functionality Power off', translated: 'Power off', value: 0 },
    ],
    [
        '+CFUN: 1',
        { category: 1, id: 'functionality', message: 'Modem functionality Normal', translated: 'Normal', value: 1 },
    ],
    [
        '+CFUN: 4',
        { category: 1, id: 'functionality', message: 'Modem functionality Offline mode', translated: 'Offline mode', value: 4 },
    ],
    [
        '+CESQ: 99,0,255,255,255,65',
        { ber: 0.1, ecno: undefined, id: 'extendedSignalQuality', message: 'reference signal received power: -76 dBm', rscp: undefined, rsrp: -76, rsrq: undefined, rssi: undefined, thresholdIndex: 3 },
    ],
    [
        '%CESQ: 77,5',
        { id: 'extendedSignalQuality', rsrp: -64, thresholdIndex: 5 },
    ],
    [
        '+COPS: (2,"","","24201"),(1,"","","24202"),(1,"","","24203")',
        { category: 3, id: 'plmnSearch', message: 'Available: Telenor Norge AS, TeliaSonera Norge AS, Televerket AS', result: { 24201: { operator: 'Telenor Norge AS', stat: 'current' }, 24202: { operator: 'TeliaSonera Norge AS', stat: 'available' }, 24203: { operator: 'Televerket AS', stat: 'available' } } },
    ],
    [
        '+COPS: 0,2,"24201"',
        { category: 3, id: 'plmn', mccmnc: '24201', message: 'Telenor Norge AS [automatic]', operator: 'Telenor Norge AS', selected: true },
    ],
    [
        '+COPS: 0,2,"24202"',
        { category: 3, id: 'plmn', mccmnc: '24202', message: 'TeliaSonera Norge AS [automatic]', operator: 'TeliaSonera Norge AS', selected: true },
    ],
    [
        '+COPS: 0,2,"24203"',
        { category: 3, id: 'plmn', mccmnc: '24203', message: 'Televerket AS [automatic]', operator: 'Televerket AS', selected: true },
    ],
    [
        '+CEREG: 2,1,"002F","0012BEEF",7',
        { AcT: 7, category: 3, causeType: undefined, ci: 1228527, domain: 'eps', id: 'registration', message: 'EPS registration: registered, home network', n: 2, rejectCause: undefined, stat: 1, status: 'registered, home network', tac: 47 },
    ],
    [
        '%XSIM: 1',
        { category: 1, id: 'uiccState', message: 'UICC init OK', value: 1 },
    ],
    [
        '%XSIM: 0',
        { category: 1, id: 'uiccState', message: 'UICC not initialized', value: 0 },
    ],
    [
        '+CPIN: "SIM PIN"',
        { category: 1, id: 'pin', message: 'PIN code required', state: 'PIN code required' },
    ],
    [
        '+CPINR: "SIM PUK",3',
        { category: 1, code: 'SIM PUK', id: 'pinRemaining', message: 'SIM PUK remaining 3 retries', retries: 3 },
    ],
    [
        '+CNEC_EMM: 26',
        { category: 4, cid: undefined, domain: 'EMM', errorCode: 26, id: 'networkError', message: 'Non-EPS authentication unacceptable' },
    ],
    [
        '+CNEC_ESM: 54,2',
        { category: 4, cid: 2, domain: 'ESM', errorCode: 54, id: 'networkError', message: 'PDN connection does not exist' },
    ],
    [
        '+CEER: This is a test error message',
        { category: 2, id: 'extendedErrorReport', message: 'This is a test error message' },
    ],
    [
        '+CGEV: NW DETACH',
        { action: 'DETACH', arg1: undefined, arg2: undefined, arg3: undefined, category: 5, id: 'packetDomain', message: 'DETACH by network', origin: 'network' },
    ],
    [
        '+CGEV: ME DETACH',
        { action: 'DETACH', arg1: undefined, arg2: undefined, arg3: undefined, category: 5, id: 'packetDomain', message: 'DETACH by mobile termination', origin: 'mobile termination' },
    ],
    [
        '+CGEV: ME PDN ACT 2,1,3',
        { action: 'PDN ACT', category: 5, cid: 2, cidOther: 3, id: 'packetDomain', message: 'PDN ACT by mobile termination, cid: 2, reason: IPv6 only allowed, cidOther: 3', origin: 'mobile termination', reason: 'IPv6 only allowed' },
    ],
    [
        '+CGEV: NW ACT 6,2,0',
        { action: 'ACT', category: 5, cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'ACT by network, pCid: 6, cid: 2, Informational', origin: 'network', pCid: 6 },
    ],
    [
        '+CGEV: ME ACT 6,2,0',
        { action: 'ACT', category: 5, cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'ACT by mobile termination, pCid: 6, cid: 2, Informational', origin: 'mobile termination', pCid: 6 },
    ],
    [
        '+CGEV: NW PDN DEACT 2',
        { action: 'PDN DEACT', category: 5, cid: 2, id: 'packetDomain', message: 'PDN DEACT by network, cid: 2', origin: 'network' },
    ],
    [
        '+CGEV: ME PDN DEACT 2',
        { action: 'PDN DEACT', category: 5, cid: 2, id: 'packetDomain', message: 'PDN DEACT by mobile termination, cid: 2', origin: 'mobile termination' },
    ],
    [
        '+CGEV: NW DEACT 6,2,0',
        { action: 'DEACT', category: 5, cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'DEACT by network, pCid: 6, cid: 2, Informational', origin: 'network', pCid: 6 },
    ],
    [
        '+CGEV: ME DEACT 6,2,0',
        { action: 'DEACT', category: 5, cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'DEACT by mobile termination, pCid: 6, cid: 2, Informational', origin: 'mobile termination', pCid: 6 },
    ],
    [
        '+CGEV: NW MODIFY 2,1,0',
        { action: 'MODIFY', category: 5, changeReason: 'TFT', cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'MODIFY by network, cid: 2, TFT changed, Informational', origin: 'network' },
    ],
    [
        '+CGEV: ME MODIFY 2,1,0',
        { action: 'MODIFY', category: 5, changeReason: 'TFT', cid: 2, eventType: 'Informational', id: 'packetDomain', message: 'MODIFY by mobile termination, cid: 2, TFT changed, Informational', origin: 'mobile termination' },
    ],
    [
        '+CGDCONT: 0,"IP","internet","10.0.1.1",0,0',
        { apn: 'internet', category: 5, cid: 0, dComp: 0, hComp: 0, id: 'pdpContext', message: 'CID: 0, APN: internet, Addr: 10.0.1.1', pdpAddr: '10.0.1.1', pdpType: 'IP' },
    ],
    [
        '+CGDCONT: 1,"IP","IOT_apn","10.0.1.2",0,0',
        { apn: 'IOT_apn', category: 5, cid: 1, dComp: 0, hComp: 0, id: 'pdpContext', message: 'CID: 1, APN: IOT_apn, Addr: 10.0.1.2', pdpAddr: '10.0.1.2', pdpType: 'IP',
        },
    ],
    [
        '+CGACT: 0,1',
        { category: 5, cid: 0, id: 'pdpContextState', message: 'CID: 0, State: activated', state: 'activated' },
    ],
    [
        '+CGACT: 1,0',
        { category: 5, cid: 1, id: 'pdpContextState', message: 'CID: 1, State: deactivated', state: 'deactivated' },
    ],
    [
        '%XDRX: 10',
        { category: 3, id: 'drxCycle', message: '163.84 seconds E-UTRAN eDRX cycle length', value: 10 },
    ],
    [
        '+CEMODE: 2',
        { category: 1, id: 'modeOfOperation', message: 'mode of operation: CS/PS mode 2', mode: 2, translated: 'CS/PS mode 2' },
    ],
    [
        '+CSRAA: 1,2,3,4,5,6,7',
        { active: { eUtranFDD: false }, id: 'supportedRadioAccess' },
    ],
    [
        '+CSRAC: 7,6,5,4,3,2,1',
        { current: { eUtranFDD: false }, id: 'supportedRadioAccess' },
    ],
    [
        '%NBRGRSRP: 4,5230,40,5,5230,39',
        { 4: { earFcn: 5230, rsrp: 40 }, 5: { earFcn: 5230, rsrp: 39 }, category: 3, id: 'neighbouringCells' },
    ],
    [
        '%CMNG: 12345678, 0, "978C...02C4"',
        {
            category: 5,
            content: undefined,
            id: 'TLSCredential',
            message: 'Root CA Certificate (12345678): 978C...02C4',
            secTag: 12345678,
            sha: '978C...02C4',
            type: 0,
        },
    ],
    [
        '%CMNG: 12345678,0,"978C...02C4","\n-----BEGIN CERTIFICATE-----\nMIIBc464...\n...bW9aAa4\n-----END CERTIFICATE-----"',
        {
            category: 5,
            content: '\n-----BEGIN CERTIFICATE-----\nMIIBc464...\n...bW9aAa4\n-----END CERTIFICATE-----',
            id: 'TLSCredential',
            message: 'Root CA Certificate (12345678): 978C...02C4',
            secTag: 12345678,
            sha: '978C...02C4',
            type: 0,
        },
    ],
];

describe('ResponseConverters', () => {
    testCommands.forEach(entry => {
        const [cmd, expected] = entry;
        it(cmd, () => {
            const pfx = cmd.slice(0, cmd.indexOf(':'));
            const converter = ResponseConverters[pfx];
            if (expected) {
                expect(converter).toBeDefined();
                expect(expected).toMatchObject(converter(cmd));
            } else {
                expect(converter).toBeUndefined();
            }
        });
    });
});

describe('port', () => {
    const port = new ModemPort('COM00');

    it('open', () => expect(port.open()).resolves.toBeUndefined());

    it('SupportedCommands', () => expect(
        port.testSupportedCommands()
            .then(() => port.getSupportedCommands()),
    ).resolves.toEqual(expect.arrayContaining(['LIST', 'OF', 'TEST', 'COMMANDS'])));

    it('ErrorReporting', () => expect(
        port.testErrorReporting()
            .then(() => port.getErrorReporting())
            .then(() => port.setErrorReporting(port.ErrorReporting.VERBOSE)),
    ).resolves.toBeUndefined());

    it('NetworkErrorReporting', () => expect(
        port.testNetworkErrorReporting()
            .then(() => port.getNetworkErrorReporting())
            .then(() => port.setNetworkErrorReporting(24))
            .catch(err => {
                expect(err.message).toEqual('testNetworkErrorReporting() failed: unknown');
                return [];
            }),
    ).resolves.toBeUndefined());

    it('Identification', () => expect(
        port.getManufacturer()
            .then(() => port.getModel())
            .then(() => port.getRevision())
            .then(() => port.getSerialNumber())
            .then(() => port.getInternationalMobileSubscriber()
                .catch(err => {
                    expect(err.message).toEqual('getInternationalMobileSubscriber() failed: SIM NOT INSERTED');
                    return [];
                }),
            ),
    ).resolves.toEqual(expect.arrayContaining([])));

    it('PacketDomainEvents', () => expect(
        port.testPacketDomainEvents()
            .then(() => port.getPacketDomainEvents())
            .then(() => port.setPacketDomainEvents(port.PacketDomainEvents.DISCARD_THEN_FORWARD)),
    ).resolves.toBeUndefined());

    it('Functionality', () => expect(
        port.getFunctionality()
            .then(() => port.setFunctionality(port.Functionality.NORMAL)),
    ).resolves.toBeUndefined());

    it('PLMNSelection', () => expect(
        port.getPLMNSelection(),
    ).resolves.toEqual(expect.arrayContaining([])));

    it('PDPContext', () => expect(
        port.getPDPContexts(),
    ).resolves.toEqual(expect.arrayContaining([])));

    it('EPSRegistration', () => expect(
        port.testEPSRegistration()
            .then(() => port.setEPSRegistration(port.Registration.ENABLE_WITH_LOCATION))
            .then(() => port.getEPSRegistration()),
    ).resolves.toMatchObject({
        id: 'registration',
    }));

    it('ExtendedSignalQuality', () => expect(
        port.testExtendedSignalQuality()
            .then(() => port.getExtendedSignalQuality()),
    ).resolves.toMatchObject({
        id: 'extendedSignalQuality',
    }));

    it('close', () => {
        port.close();
    });
});
