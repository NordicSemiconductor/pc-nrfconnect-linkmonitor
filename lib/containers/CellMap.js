/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import CellMap from '../components/CellMap';

export default connect(
    state => ({
        ...state.app.cellLocation,
        isValid: !!state.app.cellLocation.lat,
        address: state.app.cellLocation.address,
    }),
)(CellMap);
