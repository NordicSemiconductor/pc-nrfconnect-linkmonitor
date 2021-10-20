/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import PDPContext from '../components/PDPContext';

export default connect(state => ({
    ...state.app.pdpContexts,
}))(PDPContext);
