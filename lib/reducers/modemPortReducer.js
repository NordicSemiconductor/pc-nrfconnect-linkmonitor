/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    deviceName: null,
    cts: null,
    dsr: null,
};

export default function modemPort(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
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
