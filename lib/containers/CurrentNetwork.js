/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import CurrentNetwork from '../components/CurrentNetwork';
import { getCellLocation } from '../actions/modemActions';

export default connect(
    state => ({
        registration: state.app.registration.status,
        mccmnc: state.app.selectedNetwork.mccmnc,
        cid: state.app.registration.ci,
        operator: state.app.selectedNetwork.operator,
        lac: state.app.registration.tac,
    }),
    dispatch => ({
        getCellLocation: () => dispatch(getCellLocation()),
    }),
)(CurrentNetwork);
