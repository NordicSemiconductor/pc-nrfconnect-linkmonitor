/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PropTypes from 'prop-types';

const popoverUart = (
    <Popover id="tip-uart" className="tip uart">
        <ul>
            <li className="disabled">Device closed</li>
            <li className="off">Flowcontrol: off</li>
            <li className="level-1">CTS or DSR</li>
            <li className="on">Flowcontrol: on</li>
        </ul>
    </Popover>
);

const modemStateMap = {
    null: 'disabled', // device closed
    0: 'off', // Power off
    1: 'on', // Normal
    4: 'level-1', // Offline mode
    44: 'level-2', // Offline mode without shutting down UICC
};
const popoverModem = (
    <Popover id="tip-modem" className="tip modem">
        <ul>
            <li className="disabled">Device closed</li>
            <li className="off">Modem: Power off</li>
            <li className="level-1">Modem: Offline mode</li>
            <li className="level-2">
                Modem: Offline mode without shutting down UICC
            </li>
            <li className="on">Modem: Normal</li>
        </ul>
    </Popover>
);

const popoverUICC = (
    <Popover id="tip-uicc" className="tip uicc">
        <div>
            <ul>
                <li className="disabled">Device closed</li>
                <li className="off">UICC: off</li>
                <li className="on">UICC: on</li>
            </ul>
        </div>
    </Popover>
);

const lteStateMap = {
    null: 'disabled', // device closed
    0: 'off', // not registered
    1: 'on', // registered, home network
    2: 'level-1', // not registered, searching
    3: 'off', // registration denied
    4: 'disabled', // unknown
    5: 'on', // registered, roaming
    8: 'level-2', // emergency only
    90: 'off', // not registered due to UICC failure
};
const popoverLTE = (
    <Popover id="tip-lte" className="tip lte">
        <div>
            <ul>
                <li className="disabled">Device closed or unknown</li>
                <li className="off">
                    LTE: not registered, denied or UICC failure
                </li>
                <li className="on">LTE: registered, home or roaming</li>
                <li className="level-1">LTE: searching</li>
                <li className="level-2">LTE: emergency only</li>
            </ul>
        </div>
    </Popover>
);

const popoverPDN = (
    <Popover id="tip-pdn" className="tip pdn">
        <div>
            <ul>
                <li className="disabled">Packet Domain: disabled</li>
                <li className="on">Packet Domain: on</li>
                <li className="off">Packet Domain: off</li>
            </ul>
        </div>
    </Popover>
);

const overlayProps = {
    trigger: ['hover'],
    placement: 'left',
    transition: false,
};

const ConnectionStages = ({ uart, modem, uicc, lte, pdn }) => (
    <div className="connection-stages">
        <OverlayTrigger {...overlayProps} overlay={popoverUart}>
            <span className={`indicator ${uart}`}>UART</span>
        </OverlayTrigger>
        <OverlayTrigger {...overlayProps} overlay={popoverModem}>
            <span className={`indicator ${modemStateMap[modem]}`}>Modem</span>
        </OverlayTrigger>
        <OverlayTrigger {...overlayProps} overlay={popoverUICC}>
            <span className={`indicator ${uicc}`}>UICC</span>
        </OverlayTrigger>
        <OverlayTrigger {...overlayProps} overlay={popoverLTE}>
            <span className={`indicator ${lteStateMap[lte]}`}>LTE</span>
        </OverlayTrigger>
        <OverlayTrigger {...overlayProps} overlay={popoverPDN}>
            <span className={`indicator ${pdn}`}>PDN</span>
        </OverlayTrigger>
    </div>
);

ConnectionStages.propTypes = {
    uart: PropTypes.string,
    modem: PropTypes.number,
    uicc: PropTypes.string,
    lte: PropTypes.number,
    pdn: PropTypes.string,
};

ConnectionStages.defaultProps = {
    uart: 'disabled',
    modem: null,
    uicc: 'disabled',
    lte: null,
    pdn: 'disabled',
};

export default ConnectionStages;
