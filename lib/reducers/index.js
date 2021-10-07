/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from 'redux';

import ui from './uiReducer';
import chart from './chartReducer';
import mobileNetworks from './mobileNetworksReducer';
import modemPort from './modemPortReducer';
import cellLocation from './cellLocationReducer';
import rssi from './rssiReducer';
import registration from './registrationReducer';
import pdpContexts from './pdpContextsReducer';
import functionality from './functionalityReducer';
import modeOfOperation from './modeOfOperationReducer';
import bands from './bandsReducer';
import selectedNetwork from './selectedNetworkReducer';
import uicc from './uiccReducer';
import pinCode from './pinCodeReducer';
import connectionStages from './connectionStagesReducer';

const rootReducer = combineReducers({
    ui,
    chart,
    mobileNetworks,
    modemPort,
    cellLocation,
    rssi,
    registration,
    pdpContexts,
    functionality,
    modeOfOperation,
    bands,
    selectedNetwork,
    uicc,
    pinCode,
    connectionStages,
});

export default rootReducer;
