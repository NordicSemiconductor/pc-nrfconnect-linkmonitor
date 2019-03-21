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

import React from 'react';
import SidePanel from './lib/components/SidePanel';
import MainView from './lib/containers/MainView';
import NavMenu from './lib/containers/NavMenu';
import './resources/css/index.less';

import reducers from './lib/reducers';
import * as ModemActions from './lib/actions/modemActions';
import { loadCommands } from './lib/actions/terminalActions';
import { loadSettings } from './lib/actions/uiActions';

const supportedBoards = ['PCA10090', 'PCA10064'];
const platform = process.platform.slice(0, 3);

/* eslint react/prop-types: 0 */

/**
 * Pick the serialport that should belong to the modem on PCA10090
 * @param {Array<device>} serialports array of device-lister serialport objects
 * @return {object} the selected serialport object
 */
function pickSerialPort(serialports) {
    if (serialports.length === 1) {
        // Just in case a PCA10064 is selected or macOS case when serialports are split
        return serialports[0];
    }
    switch (platform) {
        case 'win':
            return serialports.find(s => (/MI_00/.test(s.pnpId)));
        case 'lin':
            return serialports.find(s => (/-if00$/.test(s.pnpId)));
        case 'dar':
            // this doesn't work, but with fixDevices() can't happen
            return serialports.find(s => (/1$/.test(s.comName)));
        default:
    }
    return undefined;
}

/**
 * Temporary workaround for macOS where serialports of PCA10090 can't be properly identified yet.
 * This function returns an array of devices where any device with 3 serialports are converted
 * to 3 devices with 1 serialport each, so the user will be able to select any of the ports.
 *
 * @param {Array<device>} devices array of device-lister device objects
 * @param {bool} autoDeviceFilter indicates if functionality is desired or not toggled by the UI
 * @return {Array<device>} fixed array
 */
function fixDevices(devices, autoDeviceFilter) {
    if (platform !== 'dar' && autoDeviceFilter) {
        return devices;
    }
    const fixedDevices = [];
    devices.forEach(device => {
        const { serialNumber } = device;
        if (device.serialport && device['serialport.1'] && device['serialport.2']) {
            const temp = [{ ...device }, { ...device }, { ...device }];
            temp[1].serialport = temp[1]['serialport.1'];
            temp[2].serialport = temp[2]['serialport.2'];
            delete temp[0]['serialport.1'];
            delete temp[0]['serialport.2'];
            delete temp[1]['serialport.1'];
            delete temp[1]['serialport.2'];
            delete temp[2]['serialport.1'];
            delete temp[2]['serialport.2'];
            temp[0].serialNumber = `${serialNumber}#0`;
            temp[1].serialNumber = `${serialNumber}#1`;
            temp[2].serialNumber = `${serialNumber}#2`;
            fixedDevices.push(...temp);
        } else {
            fixedDevices.push(device);
        }
    });
    return fixedDevices;
}

export default {
    onReady: (dispatch, getState) => {
        ModemActions.initialize(dispatch, getState);
        dispatch(loadCommands());
        dispatch(loadSettings());
    },
    decorateMainView: () => () => <MainView />,
    decorateNavMenu: () => () => <NavMenu />,
    mapDeviceSelectorState: (state, props) => ({
        autoDeviceFilter: state.app.ui.autoDeviceFilter,
        ...props,
    }),
    decorateDeviceSelector: DeviceSelector => (
        props => {
            const { devices, autoDeviceFilter, ...rest } = props;
            const filteredDevices = autoDeviceFilter
                ? devices.filter(d => supportedBoards.includes(d.boardVersion))
                : devices;
            const fixedDevices = fixDevices(filteredDevices, autoDeviceFilter);
            return <DeviceSelector {...rest} devices={fixedDevices} />;
        }
    ),
    mapSerialPortSelectorState: (state, props) => ({
        portIndicatorStatus: (state.app.modemPort.deviceName !== null) ? 'on' : 'off',
        ...props,
    }),
    decorateSidePanel: () => () => <SidePanel />,
    reduceApp: reducers,
    middleware: store => next => action => {
        if (!action) {
            return;
        }

        if (action.type === 'DEVICE_SELECTED') {
            const { device } = action;
            const serialports = Object.keys(device)
                .filter(k => k.startsWith('serialport'))
                .map(k => device[k]);

            const serialport = pickSerialPort(serialports);
            if (serialport) {
                store.dispatch(ModemActions.open(serialport));
            }
        }
        if (action.type === 'DEVICE_DESELECTED') {
            store.dispatch(ModemActions.close());
        }

        next(action);
    },
    config: {
        selectorTraits: {
            serialport: true,
            jlink: true,
        },
    },
};
