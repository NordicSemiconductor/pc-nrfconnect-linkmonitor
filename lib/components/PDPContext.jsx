/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

const PDPContext = props => (
    <table>
        <thead>
            <tr><th>cID</th><th>Addr</th></tr>
        </thead>
        <tbody>
            {
                Object.keys(props)
                    .filter(key => typeof props[key] !== 'function')
                    .map(key => (
                        <tr key={key} title={`type: ${props[key].pdpType}`}>
                            <th>{ key }</th>
                            <td>{ `${props[key].apn}` }<br />{`${props[key].pdpAddr}` }</td>
                        </tr>
                    ))
            }
        </tbody>
    </table>
);

export default PDPContext;
