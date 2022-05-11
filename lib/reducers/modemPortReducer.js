/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    availablePorts: [],
    deviceName: null,
    cts: null,
    dsr: null,
};

// eslint-disable-next-line default-param-last
export default function modemPort(state = initialState, action) {
    switch (action.type) {
        case actions.AVAILABLE_PORTS: {
            return {
                ...state,
                availablePorts: action.ports,
            };
        }
        case actions.MODEM_CLOSED:
            return {
                ...initialState,
                availablePorts: state.availablePorts,
            };
        case actions.MODEM_OPENED: {
            const { deviceName } = action;
            return {
                ...state,
                deviceName,
            };
        }
        case actions.MODEM_FLAGS_CHANGED: {
            const { cts, dsr } = action;
            return {
                ...state,
                cts,
                dsr,
            };
        }
        default:
    }
    return state;
}
