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
import RssiBars from '../containers/RssiBars';

/**
 * @param {Array<Number>} arr of numbers e.g. [1,2,3,4,7,8,9]
 * @returns {String} stringified numbers e.g. '1-4,7-9'
 */
function conciseArray(arr) {
    return arr.reduce((acc, cur, idx) => (
        idx === 0
            ? `${cur}`
            : `${acc}${(cur === arr[idx - 1] + 1) ? '-' : ','}${cur}`
    ), '').replace(/-[0-9-]+-/g, '-');
}

const Functionality = ({
    functionality, uicc, pinCode, modeOfOperation, supportedBands, currentBand,
}) => (
    <table>
        <tbody>
            <tr><th>Signal strength</th><td><RssiBars size={24} /></td></tr>
            <tr><th>Functionality</th><td>{ functionality || 'N/A' }</td></tr>
            <tr><th>UICC</th><td>{ uicc || 'N/A' }</td></tr>
            <tr><th>Pin</th><td>{ pinCode.pinState || 'N/A' }</td></tr>
            <tr><th>Pin retries</th><td>{ pinCode.retries === null ? 'N/A' : pinCode.retries }</td></tr>
            <tr><th>Mode</th><td>{ modeOfOperation || 'N/A' }</td></tr>
            <tr>
                <th>Bands</th>
                <td>{ supportedBands === null ? 'N/A' : conciseArray(supportedBands) }</td>
            </tr>
            <tr>
                <th>Current Band</th>
                <td>{ currentBand === null ? 'N/A' : currentBand }</td>
            </tr>
        </tbody>
    </table>
);

Functionality.propTypes = {
    functionality: PropTypes.string,
    modeOfOperation: PropTypes.string,
    currentBand: PropTypes.number,
    supportedBands: PropTypes.arrayOf(PropTypes.number),
    uicc: PropTypes.string,
    pinCode: PropTypes.shape({
        pinState: PropTypes.string,
        retries: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }).isRequired,
};

Functionality.defaultProps = {
    functionality: null,
    modeOfOperation: null,
    currentBand: null,
    supportedBands: null,
    uicc: null,
};

export default Functionality;
