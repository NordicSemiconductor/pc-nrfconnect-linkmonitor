/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import PropTypes from 'prop-types';

import RssiBars from '../containers/RssiBars';

/**
 * @param {Array<Number>} arr of numbers e.g. [1,2,3,4,7,8,9]
 * @returns {String} stringified numbers e.g. '1-4,7-9'
 */
function conciseArray(arr) {
    return arr
        .reduce(
            (acc, cur, idx) =>
                idx === 0
                    ? `${cur}`
                    : `${acc}${cur === arr[idx - 1] + 1 ? '-' : ','}${cur}`,
            ''
        )
        .replace(/-[0-9-]+-/g, '-');
}

const Functionality = ({
    functionality,
    uicc,
    pinCode,
    modeOfOperation,
    supportedBands,
    currentBand,
}) => (
    <table>
        <tbody>
            <tr>
                <th>Signal strength</th>
                <td>
                    <RssiBars size={24} />
                </td>
            </tr>
            <tr>
                <th>Functionality</th>
                <td>{functionality || 'N/A'}</td>
            </tr>
            <tr>
                <th>UICC</th>
                <td>{uicc || 'N/A'}</td>
            </tr>
            <tr>
                <th>Pin</th>
                <td>{pinCode.pinState || 'N/A'}</td>
            </tr>
            <tr>
                <th>Pin retries</th>
                <td>{pinCode.retries === null ? 'N/A' : pinCode.retries}</td>
            </tr>
            <tr>
                <th>Mode</th>
                <td>{modeOfOperation || 'N/A'}</td>
            </tr>
            <tr>
                <th>Bands</th>
                <td>
                    {supportedBands === null
                        ? 'N/A'
                        : conciseArray(supportedBands)}
                </td>
            </tr>
            <tr>
                <th>Current Band</th>
                <td>{currentBand === null ? 'N/A' : currentBand}</td>
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
