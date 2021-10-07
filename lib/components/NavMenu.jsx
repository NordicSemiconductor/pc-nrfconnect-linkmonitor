/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

const NavMenu = ({
    enableOpen,
    openLogfile,
}) => (
    <div className="nav-menu-wrap">
        <Button
            className="core-btn"
            variant="primary"
            disabled={!enableOpen}
            onClick={openLogfile}
        >
            <span className="mdi mdi-file-document-box-outline pr-1" />
            Open logfile
        </Button>
    </div>
);

NavMenu.propTypes = {
    enableOpen: PropTypes.bool.isRequired,
    openLogfile: PropTypes.func.isRequired,
};

export default NavMenu;
