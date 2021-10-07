/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { EventCategory } from 'modemtalk';
import microseconds from '../utils/timestamp';
import { CHART_UPDATE, CHART_WINDOW, CHART_WINDOW_RESET } from './actionIds';

export const timeseries = {
    events: [],
    signalQuality: [],
    timestamp: 0,
};

function chartUpdateAction(timestamp) {
    return {
        type: CHART_UPDATE,
        timestamp,
    };
}

export function chartUpdate(timestamp) {
    return async dispatch => dispatch(chartUpdateAction(timestamp));
}

function chartWindowAction(windowBegin, windowEnd) {
    return {
        type: CHART_WINDOW,
        windowBegin,
        windowEnd,
        windowDuration: Math.abs(windowEnd - windowBegin),
    };
}

function chartDurationAction(windowDuration) {
    return {
        type: CHART_WINDOW,
        windowBegin: 0,
        windowEnd: 0,
        windowDuration,
    };
}

export function chartWindow(windowBegin, windowEnd) {
    return dispatch => dispatch(chartWindowAction(windowBegin, windowEnd));
}

export function chartDuration(windowDuration) {
    return dispatch => dispatch(chartDurationAction(windowDuration));
}

export function chartWindowReset() {
    return dispatch => dispatch({ type: CHART_WINDOW_RESET });
}

export function clearChart() {
    return async dispatch => {
        timeseries.events.splice(0);
        timeseries.signalQuality.splice(0);
        timeseries.timestamp = 0;
        dispatch(chartUpdateAction(0));
    };
}

export function addEventToChart(dispatch, event, timestamp) {
    const ts = timestamp || microseconds();
    timeseries.timestamp = ts;

    const { id } = event;
    switch (id) {
        case 'extendedSignalQuality':
            timeseries.signalQuality.push({
                ts,
                rsrp: event.rsrp,
            });
            break;
        default:
            timeseries.events.push({
                // needs to be named x/y for the chart to avoid mapping
                x: ts,
                y: event.category || EventCategory.UNDEFINED,
                message: JSON.stringify(event),
                ...event,
            });
            break;
    }

    if (!timestamp) {
        dispatch(chartUpdateAction(ts));
    }
}
