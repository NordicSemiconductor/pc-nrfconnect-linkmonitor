/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import PropTypes from 'prop-types';

const blueColor = '#0080B7';

const RssiBars = props => {
    const { value, maxValue, size } = props;
    const styleOn = {
        fill: blueColor,
        stroke: blueColor,
    };
    const styleOff = {
        fill: 'none',
        stroke: blueColor,
    };
    const bars = Array.from(new Array(maxValue), (undef, i) => (
        <rect
            key={`${i + 1}`}
            x={i * 10 + 0.5}
            y={(maxValue - i) * 10 - 9.5}
            width={8}
            height={i * 10 + 8}
            style={value > i ? styleOn : styleOff}
        />
    ));
    return (
        <svg className="barssi" width={size} height={size} viewBox="0 0 40 40">
            {bars}
        </svg>
    );
};

RssiBars.propTypes = {
    value: PropTypes.number,
    maxValue: PropTypes.number,
    size: PropTypes.number,
};

RssiBars.defaultProps = {
    value: 0,
    maxValue: 4,
    size: 35,
};

export default RssiBars;
