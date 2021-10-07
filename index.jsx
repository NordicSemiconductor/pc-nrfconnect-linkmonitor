/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
/* eslint react/prop-types: 0 */

import React from 'react';

import * as ModemActions from './lib/actions/modemActions';
import { loadCommands } from './lib/actions/terminalActions';
import { loadSettings } from './lib/actions/uiActions';
import MainView from './lib/components/MainView';
import SidePanel from './lib/components/SidePanel';
import NavMenu from './lib/containers/NavMenu';
import reducers from './lib/reducers';

import './resources/css/index.scss';

const supportedBoards = ['PCA10090', 'PCA10064', 'PCA20035', 'THINGY91'];

export default {
    onReady: (dispatch, getState) => {
        ModemActions.initialize(dispatch, getState);
        dispatch(loadCommands());
        dispatch(loadSettings());
    },
    mapMainViewState: ({ core }, props) => ({
        ...props,
        viewId:
            core.navMenu.selectedItemId < 0 ? 1 : core.navMenu.selectedItemId,
    }),
    decorateMainView: () => props => <MainView {...props} />,
    decorateNavMenu:
        CoreNavMenu =>
        ({ selectedItemId, ...rest }) =>
            (
                <>
                    <NavMenu />
                    <CoreNavMenu
                        {...rest}
                        selectedItemId={selectedItemId < 0 ? 1 : selectedItemId}
                        menuItems={[
                            {
                                id: 0,
                                text: 'Chart',
                                iconClass: 'mdi mdi-chart-bell-curve',
                            },
                            {
                                id: 1,
                                text: 'Terminal',
                                iconClass: 'mdi mdi-console',
                            },
                            {
                                id: 2,
                                text: 'Certificate manager',
                                iconClass: 'mdi mdi-certificate',
                            },
                        ]}
                    />
                </>
            ),
    mapDeviceSelectorState: (state, props) => ({
        autoDeviceFilter: state.app.ui.autoDeviceFilter,
        portIndicatorStatus:
            state.app.modemPort.deviceName !== null ? 'on' : 'off',
        ...props,
    }),
    decorateDeviceSelector: DeviceSelector => props => {
        const { devices, autoDeviceFilter, ...rest } = props;
        const filteredDevices = autoDeviceFilter
            ? devices.filter(
                  device =>
                      supportedBoards.includes(device.boardVersion) ||
                      supportedBoards.includes(
                          device.serialNumber.split('_')[0]
                      )
              )
            : devices;
        return <DeviceSelector {...rest} devices={filteredDevices} />;
    },
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
