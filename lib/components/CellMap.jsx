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
import { Map, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Information = (
    <div>
        <p>Geolocation can not be resolved.</p>
        <small>
            <p>For successful resolution MCC/MNC, Cell ID and Tracking Area Code is required.</p>
            <p>Also make sure to use your own personal token for the service.</p>
            <p>Cell locations are cached,
            only unresolved cells are queried by this application.</p>
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
