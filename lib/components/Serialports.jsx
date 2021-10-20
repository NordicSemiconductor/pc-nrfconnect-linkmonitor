/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Group } from 'pc-nrfconnect-shared';

import * as ModemActions from '../actions/modemActions';
import Dropdown from './Dropdown';

const truncateMiddle = (str, clipStart = 20, clipEnd = 13) => {
    const clipStartWithEllipsis = clipStart + 3;
    if (str.length <= clipStartWithEllipsis) {
        return str;
    }
    const rightHandStartingPoint =
        str.length - Math.min(clipEnd, str.length - clipStartWithEllipsis);
    return `${str.substr(0, clipStart)}...${str.substr(
        rightHandStartingPoint,
        str.length
    )}`;
};

export default () => {
    const dispatch = useDispatch();
    const { deviceName, availablePorts } = useSelector(
        state => state.app.modemPort
    );

    const updateSerialPort = (_port, index) => {
        dispatch(ModemActions.open(availablePorts[index]));
    };

    return (
        <Group heading="Modem Port">
            <Dropdown
                disabled={deviceName == null}
                onSelect={updateSerialPort}
                selectedIndex={availablePorts.indexOf(deviceName)}
                items={availablePorts.map(port => truncateMiddle(port, 20, 8))}
            />
        </Group>
    );
};
