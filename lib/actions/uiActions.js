/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/no-cycle */

import {
    API_TOKEN_UPDATE,
    AUTO_DEVICE_FILTER_TOGGLED,
    AUTO_REQUESTS,
    FLOW_CONTROL,
    SIGNAL_QUALITY_INTERVAL,
    TERMINAL_AUTO_SCROLL,
} from './actionIds';
import { changeSignalQualityInterval } from './modemActions';
import persistentStore from './persistentStore';

export function autoScrollToggledAction(autoScroll) {
    persistentStore.set('autoScroll', !!autoScroll);
    return {
        type: TERMINAL_AUTO_SCROLL,
        autoScroll: !!autoScroll,
    };
}

export function flowControlToggledAction(flowControl) {
    persistentStore.set('flowControl', !!flowControl);
    return {
        type: FLOW_CONTROL,
        flowControl: !!flowControl,
    };
}

export function apiTokenUpdateAction(apiToken) {
    persistentStore.set('apiToken', apiToken);
    return {
        type: API_TOKEN_UPDATE,
        apiToken,
    };
}

export function autoRequestsToggledAction(autoRequests) {
    persistentStore.set('autoRequests', !!autoRequests);
    return {
        type: AUTO_REQUESTS,
        autoRequests: !!autoRequests,
    };
}

export function signalQualityIntervalChangedAction(signalQualityInterval) {
    persistentStore.set('signalQualityInterval', signalQualityInterval);
    return {
        type: SIGNAL_QUALITY_INTERVAL,
        signalQualityInterval,
    };
}

export function autoDeviceFilterToggledAction(autoDeviceFilter) {
    persistentStore.set('autoDeviceFilter', !!autoDeviceFilter);
    return {
        type: AUTO_DEVICE_FILTER_TOGGLED,
        autoDeviceFilter: !!autoDeviceFilter,
    };
}

function loadAndDispatch(key, defaultValue, action) {
    return dispatch => {
        if (!persistentStore.has(key)) {
            persistentStore.set(key, defaultValue);
        }
        dispatch(action(persistentStore.get(key)));
    };
}

export function loadSettings() {
    return dispatch => {
        dispatch(loadAndDispatch('autoScroll', true, autoScrollToggledAction));
        dispatch(
            loadAndDispatch('flowControl', true, flowControlToggledAction)
        );
        dispatch(
            loadAndDispatch(
                'apiToken',
                'pk.c748a4d4e6ce0bfd5491dcfb01ba9b10',
                apiTokenUpdateAction
            )
        );
        dispatch(
            loadAndDispatch('autoRequests', true, autoRequestsToggledAction)
        );
        dispatch(
            loadAndDispatch(
                'signalQualityInterval',
                0,
                changeSignalQualityInterval
            )
        );
        dispatch(
            loadAndDispatch(
                'autoDeviceFilter',
                true,
                autoDeviceFilterToggledAction
            )
        );
    };
}
