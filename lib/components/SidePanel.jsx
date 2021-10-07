/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import ConnectionStages from '../containers/ConnectionStages';
import CurrentNetwork from '../containers/CurrentNetwork';
import Functionality from '../containers/Functionality';
import MobileNetworks from '../containers/MobileNetworks';
import PDPContext from '../containers/PDPContext';
import Settings from '../containers/Settings';

const SidePanel = () => (
    <div className="core-side-panel pretty-scrollbar">
        <div>
            <ConnectionStages />
            <Functionality />
            <MobileNetworks />
            <PDPContext />
            <CurrentNetwork />
        </div>
        <Settings />
    </div>
);

export default SidePanel;
