/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    pinState: null,
    retries: null,
};

export default function pinCode(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.PIN_CODE:
            return {
                ...state,
                pinState: action.state,
            };
        case actions.PIN_REMAINING:
            return {
                ...state,
                retries: action.retries,
            };
        default:
    }
    return state;
}
