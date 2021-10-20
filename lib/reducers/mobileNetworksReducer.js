/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {};

export default function mobileNetworks(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.MOBILE_NETWORKS: {
            const networks = action.mobileNetworks;
            return {
                ...networks,
            };
        }
        case actions.SELECTED_MOBILE_NETWORK: {
            const { selectedNetwork } = action;
            const newState = {};
            Object.keys(state).forEach(mccmnc => {
                const nw = state[mccmnc];
                newState[mccmnc] = {
                    ...nw,
                    selected:
                        mccmnc === selectedNetwork.mccmnc &&
                        selectedNetwork.selected,
                };
            });
            const { mccmnc, operator, selected } = selectedNetwork;
            if (!newState[mccmnc]) {
                newState[mccmnc] = {
                    operator,
                    selected,
                };
            }
            return {
                ...newState,
            };
        }
        default:
    }
    return state;
}
