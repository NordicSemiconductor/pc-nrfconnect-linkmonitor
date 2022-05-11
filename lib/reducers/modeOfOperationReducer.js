/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = null;

// eslint-disable-next-line default-param-last
export default function modeOfOperation(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.MODE_OF_OPERATION:
            return action.mode.translated;
        default:
    }
    return state;
}
