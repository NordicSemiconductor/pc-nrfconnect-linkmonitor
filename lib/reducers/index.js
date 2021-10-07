/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers } from 'redux';

import bands from './bandsReducer';
import cellLocation from './cellLocationReducer';
import chart from './chartReducer';
import connectionStages from './connectionStagesReducer';
import functionality from './functionalityReducer';
import mobileNetworks from './mobileNetworksReducer';
import modemPort from './modemPortReducer';
import modeOfOperation from './modeOfOperationReducer';
import pdpContexts from './pdpContextsReducer';
import pinCode from './pinCodeReducer';
import registration from './registrationReducer';
import rssi from './rssiReducer';
import selectedNetwork from './selectedNetworkReducer';
import uicc from './uiccReducer';
import ui from './uiReducer';

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
