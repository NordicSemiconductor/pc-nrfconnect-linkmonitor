/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    mccmnc: null,
    operator: null,
};

// eslint-disable-next-line default-param-last
export default function selectedNetwork(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.SELECTED_MOBILE_NETWORK: {
            const { mccmnc, operator } = action.selectedNetwork;
            return { mccmnc, operator };
        }
        default:
    }
    return state;
}
