/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/no-cycle */

import { ModemPort } from 'modemtalk';
import { logger } from 'nrfconnect/core';

import * as hexEscape from '../utils/hexEscape';
import getLocation from '../utils/locationApi';
import * as actions from './actionIds';
import { addEventToChart, clearChart } from './chartActions';
import * as terminalActions from './terminalActions';
import { signalQualityIntervalChangedAction } from './uiActions';

let dispatch;
let getState;

let port;
let signalQualityInterval;

function modemOpenedAction(deviceName) {
    return {
        type: actions.MODEM_OPENED,
        deviceName,
    };
}

function modemClosedAction() {
    return {
        type: actions.MODEM_CLOSED,
    };
}

function modemFlagsChangedAction(status) {
    const { cts, dsr } = status;
    return {
        type: actions.MODEM_FLAGS_CHANGED,
        cts,
        dsr,
    };
}

function mobileNetworksAction(action) {
    return {
        type: actions.MOBILE_NETWORKS,
        mobileNetworks: action.result,
    };
}

function selectedMobileNetworkAction(selectedNetwork) {
    return {
        type: actions.SELECTED_MOBILE_NETWORK,
        selectedNetwork,
    };
}

function rssiAction(thresholdIndex) {
    return {
        type: actions.RSSI,
        thresholdIndex,
    };
}

function registrationAction(registration) {
    return {
        type: actions.REGISTRATION,
        registration,
    };
}

function cellLocationAction(cellLocation) {
    return {
        type: actions.CELL_LOCATION,
        cellLocation,
    };
}

function pdpContextAction(context) {
    return {
        type: actions.PDP_CONTEXT,
        context,
    };
}

function modeOfOperationAction(mode) {
    return {
        type: actions.MODE_OF_OPERATION,
        mode,
    };
}

function functionalityAction(functionality) {
    const { translated, value } = functionality;
    return {
        type: actions.FUNCTIONALITY,
        functionality: translated,
        value,
    };
}

function currentBandAction(currentBand) {
    return {
        type: actions.CURRENT_BAND,
        currentBand,
    };
}

function supportedBandsAction(supportedBands) {
    return {
        type: actions.SUPPORTED_BANDS,
        supportedBands,
    };
}

function uiccStateAction(uiccState) {
    const { message, value } = uiccState;
    return {
        type: actions.UICC_STATE,
        message,
        value,
    };
}

function pinCodeAction(state) {
    return {
        type: actions.PIN_CODE,
        state,
    };
}

function pinRemainingAction(retries) {
    return {
        type: actions.PIN_REMAINING,
        retries,
    };
}

export function write(data) {
    if (!port) {
        return;
    }
    const escaped = hexEscape.decode(data);
    port.writeCommand(`${escaped}${port.eol}`).catch(err => {
        if (err) {
            logger.error(err.message || err);
        }
    });
}

async function updatePDPContexts(handler) {
    try {
        const contexts = await port.getPDPContexts();
        (contexts || []).forEach(ctx => handler(ctx));
        const states = await port.getPDPContextStates();
        (states || []).forEach(state => handler(state));
    } catch (err) {
        logger.error(err.message);
    }
}

async function checkAndSetSubscriptions(handler) {
    try {
        if ((await port.getErrorReporting()) !== 'numeric') {
            await port.setErrorReporting(port.ErrorReporting.NUMERIC);
        }
    } catch (err) {
        logger.error(err.message);
    }

    try {
        if ((await port.getNetworkErrorReporting()) !== 'EMM+ESM') {
            await port.setNetworkErrorReporting(
                port.NetworkErrorReporting.EMM_ESM
            );
        }
    } catch (err) {
        logger.error(err.message);
    }

    try {
        const pdEvents = await port.getPacketDomainEvents();
        if (pdEvents.mode !== port.PacketDomainEvents.DISCARD_THEN_FORWARD) {
            await updatePDPContexts(handler);
            await port.setPacketDomainEvents(
                port.PacketDomainEvents.DISCARD_THEN_FORWARD
            );
        }
    } catch (err) {
        logger.error(err.message);
    }

    try {
        await port.setIndicatorControl(true, true, true);
    } catch (err) {
        logger.error(err.message);
    }
}

export function getCellLocation() {
    return async () => {
        const { mccmnc } = getState().app.selectedNetwork;
        const { apiToken } = getState().app.ui;
        const { tac, ci } = getState().app.registration;
        try {
            const cellLocation = await getLocation(
                { tac, ci },
                mccmnc,
                apiToken
            );
            dispatch(cellLocationAction(cellLocation));
        } catch (err) {
            if (err) {
                logger.error(err.message);
            }
        }
    };
}

async function unsolicitedHandler(event, timestamp) {
    async function identifyModem() {
        try {
            const serNr = await port.getSerialNumber(1);
            logger.info(
                `${await port.getManufacturer()} ${await port.getModel()}` +
                    ` [${await port.getRevision()}]` +
                    ` SerNr: ${(serNr || {}).value}`
            );
        } catch (err) {
            logger.error(err.message);
        }

        try {
            await unsolicitedHandler(await port.getModeOfOperation());
        } catch (err) {
            logger.error(err.message);
        }

        try {
            await unsolicitedHandler(await port.testCurrentBand());
        } catch (err) {
            logger.error(err.message);
        }
    }

    if (!event) {
        return undefined;
    }
    const { id } = event;
    if (id === 'extendedSignalQuality') {
        dispatch(rssiAction(event.thresholdIndex));
    }

    addEventToChart(dispatch, event, timestamp);

    switch (id) {
        case 'functionality': {
            // temp, app fw needs to do this
            if (
                event.value === port.Functionality.OFFLINE_MODE &&
                getState().app.ui.autoRequests
            ) {
                await port.setFunctionality(port.Functionality.NORMAL);
                return undefined;
            }
            const isModemOn = event.value === port.Functionality.NORMAL;
            dispatch(functionalityAction(event));
            if (isModemOn && getState().app.ui.autoRequests) {
                await identifyModem();
                await checkAndSetSubscriptions(unsolicitedHandler);

                try {
                    await port.setEPSRegistration(port.Registration.ENABLE_5);
                    await unsolicitedHandler(await port.getEPSRegistration());
                } catch (err) {
                    logger.error(err.message);
                }

                await port.setSignalQualityNotification(true);
                await unsolicitedHandler(await port.getExtendedSignalQuality());

                await port.setSubscribeToUiccState(true);
                await unsolicitedHandler(await port.getUiccState());
            }
            break;
        }
        case 'plmnSearch':
            dispatch(mobileNetworksAction(event));
            break;
        case 'plmn':
            dispatch(selectedMobileNetworkAction(event));
            break;
        case 'registration': {
            dispatch(registrationAction(event));
            if (
                (event.stat === 1 || event.stat === 5) &&
                getState().app.ui.autoRequests
            ) {
                // registered home or roaming
                await port.setPLMNSelection(
                    port.PLMNMode.SET_FORMAT,
                    port.PLMNFormat.NUMERIC
                );
                await unsolicitedHandler(await port.getPLMNSelection());
                await unsolicitedHandler(await port.getCurrentBand());
                await updatePDPContexts(unsolicitedHandler);
            }
            break;
        }
        case 'pdpContext':
            dispatch(pdpContextAction(event));
            break;
        case 'modeOfOperation':
            dispatch(modeOfOperationAction(event));
            break;
        case 'currentBand':
            dispatch(currentBandAction(event.band));
            break;
        case 'supportedBands':
            dispatch(supportedBandsAction(event.bands));
            break;
        case 'packetDomain': {
            if (getState().app.ui.autoRequests) {
                await updatePDPContexts(unsolicitedHandler);
            }
            break;
        }
        case 'uiccState': {
            dispatch(uiccStateAction(event));
            if (event.value === 1 && getState().app.ui.autoRequests) {
                await unsolicitedHandler(await port.checkPIN());
                try {
                    logger.info(
                        `IMSIdentity: ${await port.getInternationalMobileSubscriber()}`
                    );
                } catch (err) {
                    logger.error(err.message);
                }
            }
            break;
        }
        case 'pin': {
            dispatch(pinCodeAction(event.state));
            if (getState().app.ui.autoRequests) {
                await unsolicitedHandler(await port.getPINRetries());
            }
            break;
        }
        case 'pinRemaining':
            dispatch(pinRemainingAction(event.retries));
            break;
        default:
    }

    return event;
}

async function pollSignalQuality() {
    if (
        getState().app.connectionStages.modem === 1 &&
        getState().app.ui.autoRequests
    ) {
        await unsolicitedHandler(await port.getExtendedSignalQuality());
    }
}

export function changeSignalQualityInterval(interval) {
    return () => {
        clearInterval(signalQualityInterval);
        dispatch(signalQualityIntervalChangedAction(interval));
        if (interval) {
            signalQualityInterval = setInterval(
                pollSignalQuality,
                interval * 1000
            );
        }
    };
}

export function networkSearch() {
    return async () => {
        try {
            await unsolicitedHandler(await port.testPLMNSelection());
            await unsolicitedHandler(await port.getPLMNSelection());
        } catch (err) {
            logger.error(`Network search failed: ${err.message}`);
        }
    };
}

export function writeTLSCredential(secTag, type, content, password) {
    return async () => {
        if (!port) {
            throw new Error('Device is not open.');
        }
        return port.writeTLSCredential(secTag, type, content, password);
    };
}

export function deleteTLSCredential(secTag, type) {
    return async () => {
        if (!port) {
            throw new Error('Device is not open.');
        }
        return port.deleteTLSCredential(secTag, type);
    };
}

export function close() {
    return async () => {
        if (port && port.isOpen) {
            port.removeListener('event', unsolicitedHandler);
            await new Promise(resolve => {
                port.close(() => {
                    logger.info('Modem port is closed');
                    dispatch(modemClosedAction());
                    resolve();
                });
            });
        }
        port = undefined;
    };
}

export function open(portPath) {
    return async () => {
        await dispatch(close());
        dispatch(clearChart());

        function writeCallback(data) {
            logger.debug(`modem >> ${hexEscape.remove(data)}`);
            dispatch(terminalActions.printTX(data));
        }

        port = new ModemPort(portPath, {
            rtscts: getState().app.ui.flowControl,
            writeCallback,
        });

        port.on('event', unsolicitedHandler);
        port.on('error', err => {
            logger.error('Serial port error: ', err.message);
        });
        port.on('disconnect', () => {
            logger.info('Serial port has been disconnected');
            dispatch({ type: 'SERIAL_PORT_DESELECTED' });
        });
        port.on('rx', (data, unsolicited) => {
            logger.debug(`modem << ${hexEscape.remove(data)}`);
            dispatch(
                terminalActions.print(data, unsolicited ? 'unsolicited' : 'rx')
            );
        });
        port.on('modemBits', status => {
            dispatch(modemFlagsChangedAction(status));
        });

        try {
            await port.open();
        } catch (err) {
            logger.error(err.message);
            dispatch({ type: 'SERIAL_PORT_DESELECTED' });
            return;
        }
        logger.info('Modem port is opened');
        dispatch(modemOpenedAction(portPath));

        if (getState().app.ui.autoRequests) {
            try {
                await unsolicitedHandler(await port.getFunctionality());
            } catch (err) {
                // no response from modem, error is not relevant here
            }
        }
    };
}

export function initialize(d, g) {
    dispatch = d;
    getState = g;
}
