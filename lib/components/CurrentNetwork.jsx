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
import Button from 'react-bootstrap/Button';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import CellMap from '../containers/CellMap';

const popoverMap = (<Popover id="cell-map" className="tip"><CellMap /></Popover>);

const overlayProps = { trigger: ['click'], placement: 'left', transition: false };

const locationIcon = (
    <svg
        style={{ height: 24, marginBottom: -5, paddingRight: 6 }}
        className="icon"
        viewBox="0 0 34 34"
        aria-hidden
    >
        <path
            fill="white"
            d="m17,0.5a8,8 0 0 0 -8,8a8,8 0 0 0 0.7,3.2l-0.011,0l7.3,16l7.3,-16l0,0a8,8
            0 0 0 0.7,-3.2a8,8 0 0 0 -8,-8l0,0l0.011,0zm0,3.7a4.3,4.3 0 0 1 4.3,4.3a4.3,4.3
            0 0 1 -4.3,4.3a4.3,4.3 0 0 1 -4.3,-4.3a4.3,4.3 0 0 1 4.3,-4.3zm-3.2,19c-1.3,0.17
            -2.5,0.44 -3.6,0.82c-0.95,0.34 -1.8,0.76 -2.5,1.4c-0.7,0.6 -1.3,1.5 -1.3,2.6c0,1.1 0.6,2
            1.3,2.6c0.7,0.6 1.5,1 2.5,1.4c1.9,0.7 4.3,1 6.8,1c2.4,0 4.9,-0.34 6.8,-1c0.95,-0.34
            1.8,-0.76 2.5,-1.4c0.7,-0.6 1.3,-1.5 1.3,-2.6c0,-1.1 -0.6,-2 -1.3,-2.6c-0.7,-0.6
            -1.5,-1 -2.5,-1.4c-1.1,-0.38 -2.3,-0.65 -3.6,-0.82l-0.81,1.8a8.7,3.1 0 0 1
            6.3,3a8.7,3.1 0 0 1 -8.7,3.1a8.7,3.1 0 0 1 -8.7,-3.1a8.7,3.1 0 0 1 6.3,-3l-0.79,-1.8z"
        />
    </svg>
);

const CurrentNetwork = ({
    registration, mccmnc, operator, cid, lac, getCellLocation,
}) => (
    <table>
        <tbody>
            <tr><th>Registration</th><td>{ registration || 'N/A' }</td></tr>
            <tr><th>MccMnc</th><td>{ mccmnc || 'N/A' }</td></tr>
            <tr><th>Operator</th><td>{ operator || 'N/A' }</td></tr>
            <tr><th>CellID</th>
                { cid && (
                    <td title={`0x${cid.toString(16).toUpperCase().padStart(8, '0')}`}>
                        { cid }
                    </td>
                )}
            </tr>
            <tr><th>TAC</th>
                { lac && (
                    <td title={`0x${lac.toString(16).toUpperCase().padStart(4, '0')}`}>
                        { lac }
                    </td>
                )}
            </tr>
            <tr>
                <td colSpan="2" style={{ textAlign: 'center', paddingTop: 8 }}>
                    <OverlayTrigger {...overlayProps} overlay={popoverMap}>
                        <Button
                            className="core-btn"
                            variant="primary"
                            size="small"
                            style={{ paddingBottom: 8 }}
                            onClick={getCellLocation}
                        >
                            {locationIcon}
                            Show serving station location
                        </Button>
                    </OverlayTrigger>
                </td>
            </tr>
        </tbody>
    </table>
);

CurrentNetwork.propTypes = {
    registration: PropTypes.string,
    mccmnc: PropTypes.string,
    cid: PropTypes.number,
    operator: PropTypes.string,
    lac: PropTypes.number,
    getCellLocation: PropTypes.func.isRequired,
};

CurrentNetwork.defaultProps = {
    registration: null,
    mccmnc: null,
    cid: null,
    operator: null,
    lac: null,
};

export default CurrentNetwork;
