/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Circle, Map, TileLayer } from 'react-leaflet';
import PropTypes from 'prop-types';

import 'leaflet/dist/leaflet.css';

const Information = (
    <div>
        <p>Geolocation can not be resolved.</p>
        <small>
            <p>
                For successful resolution MCC/MNC, Cell ID and Tracking Area
                Code is required.
            </p>
            <p>
                Also make sure to use your own personal token for the service.
            </p>
            <p>
                Cell locations are cached, only unresolved cells are queried by
                this application.
            </p>
        </small>
    </div>
);

const CellMap = ({ isValid, accuracy, lat, lon, address }) => {
    const position = [lat, lon];
    const zoom = isValid ? 10 : 1;
    if (isValid) {
        return (
            <div style={{ width: 370 }}>
                <Map center={position} zoom={zoom}>
                    <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
                    <Circle center={position} radius={accuracy} />
                </Map>
                <pre>{address.replace(/, /g, '\n')}</pre>
            </div>
        );
    }
    return Information;
};

CellMap.propTypes = {
    accuracy: PropTypes.number,
    lat: PropTypes.number,
    lon: PropTypes.number,
    isValid: PropTypes.bool,
    address: PropTypes.string,
};

CellMap.defaultProps = {
    accuracy: 10000,
    lat: 0,
    lon: 0,
    isValid: false,
    address: null,
};

export default CellMap;
