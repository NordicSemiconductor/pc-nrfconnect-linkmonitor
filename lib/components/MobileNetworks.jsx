/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable react/destructuring-assignment */

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const OperatorList = props => (
    <>
        {Object.keys(props)
            .filter(key => typeof props[key] !== 'function')
            .map(key => (
                <tr
                    key={key}
                    title={`Network ID: ${key}`}
                    className={props[key].selected ? 'selected' : ''}
                >
                    <td>{props[key].operator}</td>
                    <td>{props[key].stat}</td>
                </tr>
            ))}
    </>
);

const MobileNetworks = ({ networkSearch, ...props }) => (
    <table className="mobileNetworks">
        <thead>
            <tr>
                <th>Network</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <OperatorList {...props} />
            <tr>
                <td colSpan={2} style={{ paddingTop: 10 }}>
                    <Button
                        className="core-btn"
                        size="sm"
                        variant="primary"
                        onClick={networkSearch}
                    >
                        Search networks
                    </Button>
                </td>
            </tr>
        </tbody>
    </table>
);

MobileNetworks.propTypes = {
    networkSearch: PropTypes.func.isRequired,
};

export default MobileNetworks;
