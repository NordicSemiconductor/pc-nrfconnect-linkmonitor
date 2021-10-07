/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as actions from '../actions/actionIds';

const initialState = {
    timestamp: 0,
    windowBegin: 0,
    windowEnd: 0,
    windowDuration: 120000000,
};

export default function chart(state = initialState, action) {
    switch (action.type) {
        case actions.CHART_UPDATE: {
            const { timestamp } = action;
            return {
                ...state,
                timestamp,
            };
        }
        case actions.CHART_WINDOW: {
            const { windowBegin, windowEnd, windowDuration } = action;
            return {
                ...state,
                windowBegin,
                windowEnd,
                windowDuration,
            };
        }
        case actions.CHART_WINDOW_RESET: {
            return {
                ...state,
                windowBegin: 0,
                windowEnd: 0,
            };
        }
        default:
    }
    return state;
}
