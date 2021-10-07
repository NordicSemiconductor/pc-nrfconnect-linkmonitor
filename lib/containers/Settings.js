/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import TerminalView from '../components/Settings';
import {
    autoScrollToggledAction,
    flowControlToggledAction,
    apiTokenUpdateAction,
    autoRequestsToggledAction,
    autoDeviceFilterToggledAction,
} from '../actions/uiActions';

import { changeSignalQualityInterval } from '../actions/modemActions';

export default connect(
    state => ({
        autoScroll: state.app.ui.autoScroll,
        flowControl: state.app.ui.flowControl,
        pollSignalQuality: state.app.ui.pollSignalQuality,
        apiToken: state.app.ui.apiToken,
        autoRequests: state.app.ui.autoRequests,
        signalQualityInterval: state.app.ui.signalQualityInterval,
        autoDeviceFilter: state.app.ui.autoDeviceFilter,
    }),
    dispatch => ({
        autoScrollToggled: autoScroll => (
            dispatch(autoScrollToggledAction(autoScroll))
        ),
        flowControlToggled: flowControl => (
            dispatch(flowControlToggledAction(flowControl))
        ),
        apiTokenUpdate: apiToken => (
            dispatch(apiTokenUpdateAction(apiToken))
        ),
        autoRequestsToggled: autoRequests => (
            dispatch(autoRequestsToggledAction(autoRequests))
        ),
        signalQualityIntervalChanged: interval => (
            dispatch(changeSignalQualityInterval(interval))
        ),
        autoDeviceFilterToggled: autoDeviceFilter => (
            dispatch(autoDeviceFilterToggledAction(autoDeviceFilter))
        ),
    }),
)(TerminalView);
