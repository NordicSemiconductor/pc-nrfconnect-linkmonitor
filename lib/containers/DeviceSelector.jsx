/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceSelector, logger } from 'pc-nrfconnect-shared';

import * as ModemActions from '../actions/modemActions';

const deviceListing = {
    serialPorts: true,
};

export default () => {
    const dispatch = useDispatch();
    const autoDeviceFilter = useSelector(
        state => state.app.ui.autoDeviceFilter
    );

    const openPort = useCallback(
        device => {
            const ports = device.serialPorts
                .filter(port => port.comName != null)
                .map(port => port.comName);

            dispatch(ModemActions.availablePortsAction(ports));

            const modemPort = ports[0];
            if (modemPort) {
                dispatch(ModemActions.open(modemPort));
            } else {
                logger.error("Couldn't identify serial port");
                dispatch({ type: 'device/deselectDevice' });
            }
        },
        [dispatch]
    );

    const closePort = useCallback(() => {
        dispatch(ModemActions.close());

        dispatch(ModemActions.availablePortsAction());
    }, [dispatch]);

    const deviceFilter = useCallback(
        device => {
            console.log(device);
            if (!autoDeviceFilter) {
                return true;
            }

            const supportedBoards = [
                'PCA10090',
                'PCA10064',
                'PCA20035',
                'THINGY91',
            ];
            return (
                supportedBoards.includes(device.boardVersion) ||
                supportedBoards.includes(device.serialNumber.split('_')[0])
            );
        },
        [autoDeviceFilter]
    );

    return (
        <DeviceSelector
            deviceListing={deviceListing}
            deviceFilter={deviceFilter}
            onDeviceSelected={openPort}
            onDeviceDeselected={closePort}
        />
    );
};
