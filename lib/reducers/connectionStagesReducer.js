/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    uart: null,
    modem: null,
    uicc: null,
    lte: null,
};

export default function connectionStages(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.MODEM_OPENED: {
            return {
                uart: 'off',
                modem: 0,
                uicc: 'off',
                lte: 0,
            };
        }
        case actions.MODEM_FLAGS_CHANGED: {
            const { cts, dsr } = action;
            let uart = 'off';
            if (cts || dsr) uart = 'level-1';
            if (cts && dsr) uart = 'on';
            return {
                ...state,
                uart,
            };
        }
        case actions.FUNCTIONALITY: {
            return {
                ...state,
                modem: action.value,
            };
        }
        case actions.UICC_STATE: {
            return {
                ...state,
                uicc: (action.value === 1) ? 'on' : 'off',
            };
        }
        case actions.REGISTRATION: {
            const { stat } = action.registration;
            return {
                ...state,
                lte: stat,
            };
        }
        default:
    }
    return state;
}
