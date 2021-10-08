/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import ConnectionStages from '../containers/ConnectionStages';
import CurrentNetwork from '../containers/CurrentNetwork';
import Functionality from '../containers/Functionality';
import MobileNetworks from '../containers/MobileNetworks';
import PDPContext from '../containers/PDPContext';
import Settings from '../containers/Settings';
import Serialports from './Serialports';

export default () => (
    <SidePanel className="linkmonitor-side-panel">
        <Serialports />
        <ConnectionStages />
        <Functionality />
        <MobileNetworks />
        <PDPContext />
        <CurrentNetwork />
        <Settings />
    </SidePanel>
);
