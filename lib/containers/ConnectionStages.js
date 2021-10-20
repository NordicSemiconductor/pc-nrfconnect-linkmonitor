/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import ConnectionStages from '../components/ConnectionStages';

function pdn(state) {
    // if modem is not online
    if (state.app.connectionStages.modem !== 1) {
        return null;
    }
    if (Object.keys(state.app.pdpContexts).length === 0) {
        return 'off';
    }
    return 'on';
}

export default connect(state => ({
    ...state.app.connectionStages,
    pdn: pdn(state),
}))(ConnectionStages);
