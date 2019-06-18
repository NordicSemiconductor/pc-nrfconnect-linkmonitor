/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Popover, OverlayTrigger } from 'react-bootstrap';

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
            <li className="level-2">Modem: Offline mode without shutting down UICC</li>
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
                <li className="off">LTE: not registered, denied or UICC failure</li>
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

const overlayProps = { trigger: ['hover'], placement: 'left', animation: false };

const ConnectionStages = ({
    uart, modem, uicc, lte, pdn,
}) => (
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
