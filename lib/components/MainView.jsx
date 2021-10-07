/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import PropTypes from 'prop-types';
import TerminalView from '../containers/TerminalView';
import Chart from '../containers/Chart';
import CertificateManagerView from '../containers/CertificateManagerView';

const MainView = ({ viewId }) => (
    <div className="core-main-view">
        <Chart hidden={viewId !== 0} />
        <TerminalView hidden={viewId !== 1} />
        <CertificateManagerView hidden={viewId !== 2} />
    </div>
);

MainView.propTypes = {
    viewId: PropTypes.number.isRequired,
};

export default MainView;
