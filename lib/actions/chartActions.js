/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import microseconds from '../utils/timestamp';
import { EventCategory } from 'modemtalk';
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
