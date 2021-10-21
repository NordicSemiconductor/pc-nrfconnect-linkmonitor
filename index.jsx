/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useContext, useEffect } from 'react';
import { ReactReduxContext } from 'react-redux';
import { App } from 'pc-nrfconnect-shared';

import * as ModemActions from './lib/actions/modemActions';
import { loadCommands } from './lib/actions/terminalActions';
import { loadSettings } from './lib/actions/uiActions';
import CertificateManagerView from './lib/components/CertificateManagerView';
import DocumentationSections from './lib/components/DocumentationSection';
import SidePanel from './lib/components/SidePanel';
import Chart from './lib/containers/Chart';
import DeviceSelector from './lib/containers/DeviceSelector';
import TerminalView from './lib/containers/TerminalView';
import appReducer from './lib/reducers';

import './resources/css/index.scss';

const AppInitialiser = () => {
    const { store } = useContext(ReactReduxContext);
    const { getState, dispatch } = store;

    useEffect(() => {
        ModemActions.initialize(dispatch, getState);
        dispatch(loadCommands());
        dispatch(loadSettings());
    }, [dispatch, getState]);
    return null;
};

export default () => (
    <App
        appReducer={appReducer}
        sidePanel={<SidePanel />}
        deviceSelect={<DeviceSelector />}
        panes={[
            { name: 'Chart', Main: Chart },
            { name: 'Terminal', Main: TerminalView },
            { name: 'Certificate manager', Main: CertificateManagerView },
        ]}
        documentation={DocumentationSections}
    >
        <AppInitialiser />
    </App>
);
