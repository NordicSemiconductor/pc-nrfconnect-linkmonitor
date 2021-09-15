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
/* eslint react/prop-types: 0 */

import React from 'react';
import SidePanel from './lib/components/SidePanel';
import MainView from './lib/components/MainView';
import NavMenu from './lib/containers/NavMenu';
import './resources/css/index.scss';

import reducers from './lib/reducers';
import * as ModemActions from './lib/actions/modemActions';
import { loadCommands } from './lib/actions/terminalActions';
import { loadSettings } from './lib/actions/uiActions';

const supportedBoards = ['PCA10090', 'PCA10064', 'PCA20035', 'THINGY91'];

export default {
    onReady: (dispatch, getState) => {
        ModemActions.initialize(dispatch, getState);
        dispatch(loadCommands());
        dispatch(loadSettings());
    },
    mapMainViewState: ({ core }, props) => ({
        ...props,
        viewId: core.navMenu.selectedItemId < 0 ? 1 : core.navMenu.selectedItemId,
    }),
    decorateMainView: () => props => <MainView {...props} />,
    decorateNavMenu: CoreNavMenu => ({ selectedItemId, ...rest }) => (
        <>
            <NavMenu />
            <CoreNavMenu
                {...rest}
                selectedItemId={selectedItemId < 0 ? 1 : selectedItemId}
                menuItems={[
                    { id: 0, text: 'Chart', iconClass: 'mdi mdi-chart-bell-curve' },
                    { id: 1, text: 'Terminal', iconClass: 'mdi mdi-console' },
                    { id: 2, text: 'Certificate manager', iconClass: 'mdi mdi-certificate' },
                ]}
            />
        </>
    ),
    mapDeviceSelectorState: (state, props) => ({
        autoDeviceFilter: state.app.ui.autoDeviceFilter,
        portIndicatorStatus: (state.app.modemPort.deviceName !== null) ? 'on' : 'off',
        ...props,
    }),
    decorateDeviceSelector: DeviceSelector => (
        props => {
            const { devices, autoDeviceFilter, ...rest } = props;
            const filteredDevices = autoDeviceFilter
                ? devices.filter(device => (
                    supportedBoards.includes(device.boardVersion)
                    || supportedBoards.includes(device.serialNumber.split('_')[0])
                ))
                : devices;
            return <DeviceSelector {...rest} devices={filteredDevices} />;
        }
    ),
    decorateSidePanel: () => () => <SidePanel />,
    reduceApp: reducers,
    middleware: store => next => action => {
        if (!action) {
            return;
        }

        if (action.type === 'DEVICE_SELECTED') {
            const { device } = action;

            const serialport = device.serialPorts[0];

            if (serialport) {
                store.dispatch(ModemActions.open(serialport.comName));
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
        },
    },
};
