/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    chartDuration,
    chartWindow,
    chartWindowReset,
} from '../actions/chartActions';
import openLogfile from '../actions/logfileActions';
import Chart from '../components/Chart';

export default connect(
    state => ({
        ...state.app.chart,
        isLive: state.app.chart.windowEnd === 0,
        isConnected: state.app.modemPort.deviceName != null,
    }),
    dispatch =>
        bindActionCreators(
            {
                chartWindow,
                chartDuration,
                chartWindowReset,
                openLogfile,
            },
            dispatch
        )
)(Chart);
