/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {};

export default function pdpContexts(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.PDP_CONTEXT: {
            const { cid, apn, pdpType, pdpAddr } = action.context;
            return {
                ...state,
                [cid]: { apn, pdpType, pdpAddr },
            };
        }
        default:
    }
    return state;
}
