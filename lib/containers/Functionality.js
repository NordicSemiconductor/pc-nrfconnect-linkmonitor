/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import Functionality from '../components/Functionality';

export default connect(
    state => ({
        functionality: state.app.functionality,
        modeOfOperation: state.app.modeOfOperation,
        currentBand: state.app.bands.currentBand,
        supportedBands: state.app.bands.supportedBands,
        uicc: state.app.uicc,
        pinCode: state.app.pinCode,
    }),
)(Functionality);
