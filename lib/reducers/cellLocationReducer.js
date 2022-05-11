/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    lat: null,
    lon: null,
    accuracy: null,
    address: null,
    lac: null,
    cid: null,
};

// eslint-disable-next-line default-param-last
export default function cellLocationReducer(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.CELL_LOCATION: {
            const { lat, lon, accuracy, address, lac, cid } =
                action.cellLocation;
            return {
                lat,
                lon,
                accuracy,
                address,
                lac,
                cid,
            };
        }
        default:
    }
    return state;
}
