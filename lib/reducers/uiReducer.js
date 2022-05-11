/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    terminalUpdate: 0,
    commands: [],
    flowControl: true,
    autoScroll: true,
    apiToken: '',
    autoRequests: false,
    signalQualityInterval: 0,
    autoDeviceFilter: true,
};

// eslint-disable-next-line default-param-last
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case actions.UPDATE_TERMINAL: {
            const { update } = action;
            return {
                ...state,
                terminalUpdate: update,
            };
        }
        case actions.UPDATE_SAVED_COMMANDS: {
            const { commands } = action;
            return {
                ...state,
                commands,
            };
        }
        case actions.TERMINAL_AUTO_SCROLL: {
            const { autoScroll } = action;
            return {
                ...state,
                autoScroll,
            };
        }
        case actions.FLOW_CONTROL: {
            const { flowControl } = action;
            return {
                ...state,
                flowControl,
            };
        }
        case actions.API_TOKEN_UPDATE: {
            const { apiToken } = action;
            return {
                ...state,
                apiToken,
            };
        }
        case actions.AUTO_REQUESTS: {
            const { autoRequests } = action;
            return {
                ...state,
                autoRequests,
            };
        }
        case actions.SIGNAL_QUALITY_INTERVAL: {
            const { signalQualityInterval } = action;
            return {
                ...state,
                signalQualityInterval,
            };
        }
        case actions.AUTO_DEVICE_FILTER_TOGGLED: {
            const { autoDeviceFilter } = action;
            return {
                ...state,
                autoDeviceFilter,
            };
        }
        default:
    }
    return state;
}
