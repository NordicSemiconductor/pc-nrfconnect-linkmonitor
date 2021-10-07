/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import openLogfile from '../actions/logfileActions';
import NavMenu from '../components/NavMenu';

export default connect(
    ({ app }) => ({
        enableOpen: app.modemPort.deviceName === null,
    }),
    dispatch => ({
        openLogfile: () => dispatch(openLogfile()),
    })
)(NavMenu);
