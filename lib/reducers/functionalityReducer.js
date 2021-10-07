/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = null;

export default function functionality(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.FUNCTIONALITY: {
            return action.functionality;
        }
        default:
    }
    return state;
}
