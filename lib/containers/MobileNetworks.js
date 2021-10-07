/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { networkSearch } from '../actions/modemActions';
import MobileNetworks from '../components/MobileNetworks';

export default connect(
    state => ({
        ...state.app.mobileNetworks,
    }),
    dispatch => ({
        networkSearch: () => dispatch(networkSearch()),
    }),
)(MobileNetworks);
