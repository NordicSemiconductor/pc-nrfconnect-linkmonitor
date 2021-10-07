/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    domain: null,
    stat: null,
    status: null,
    tac: null,
    ci: null,
    AcT: null,
    causeType: null,
    rejectCause: null,
};

export default function registration(state = initialState, action) {
    switch (action.type) {
        case actions.MODEM_CLOSED:
            return initialState;
        case actions.REGISTRATION: {
            const {
                domain,
                stat,
                status,
                tac,
                ci,
                AcT,
                causeType,
                rejectCause,
            } = action.registration;
            return {
                domain,
                stat,
                status,
                tac,
                ci,
                AcT,
                causeType,
                rejectCause,
            };
        }
        default:
    }
    return state;
}
