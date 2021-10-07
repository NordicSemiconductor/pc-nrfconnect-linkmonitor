/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Chart from '../components/Chart';
import { chartWindow, chartDuration, chartWindowReset } from '../actions/chartActions';

export default connect(
    state => ({
        ...state.app.chart,
        isLive: (state.app.chart.windowEnd === 0),
    }),
    dispatch => bindActionCreators({
        chartWindow,
        chartDuration,
        chartWindowReset,
    }, dispatch),
)(Chart);
