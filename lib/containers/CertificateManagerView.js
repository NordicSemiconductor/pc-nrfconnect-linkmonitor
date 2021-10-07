/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import {
    deleteTLSCredential,
    writeTLSCredential,
} from '../actions/modemActions';
import CertificateManagerView from '../components/CertificateManagerView';

export default connect(
    () => ({}),
    dispatch => ({
        writeTLSCredential: (...args) => dispatch(writeTLSCredential(...args)),
        deleteTLSCredential: (...args) =>
            dispatch(deleteTLSCredential(...args)),
    })
)(CertificateManagerView);
