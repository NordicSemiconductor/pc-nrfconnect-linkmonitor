/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    currentBand: null,
    supportedBands: null,
};

export default function bands(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.CURRENT_BAND: {
            return {
                ...state,
                currentBand: action.currentBand,
            };
        }
        case actions.SUPPORTED_BANDS: {
            return {
                ...state,
                supportedBands: [...action.supportedBands],
            };
        }
        default:
    }
    return state;
}
