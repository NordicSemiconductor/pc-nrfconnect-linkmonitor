/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import RssiBars from '../components/RssiBars';

export default connect(state => ({
    value: state.app.rssi,
}))(RssiBars);
