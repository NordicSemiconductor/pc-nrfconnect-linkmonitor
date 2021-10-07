/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint no-param-reassign: off */

const wheelZoomFactor = 1.25;

export default {
    id: 'zoomPan',

    beforeInit(chartInstance) {
        const zoomPan = {};
        chartInstance.zoomPan = zoomPan;

        const { canvas } = chartInstance.chart.ctx;

        zoomPan.zoomAtOriginBy = (p, factor, min, max) => {
            const z = Math.max(factor, 0.1);
            const newMin = p - ((p - min) / z);
            const newMax = p + ((max - p) / z);
            zoomPan.callback(newMin, newMax);
        };

        zoomPan.wheelHandler = event => {
            if (!zoomPan.callback) {
                return;
            }

            const { xScale } = chartInstance.scales;
            const offsetX = event.target.getBoundingClientRect().left;
            const p = xScale.getValueForPixel(event.clientX - offsetX);

            let z = 0;
            if (event.deltaY < 0) z = wheelZoomFactor;
            if (event.deltaY > 0) z = 1 / wheelZoomFactor;

            const { min, max } = xScale;
            zoomPan.zoomAtOriginBy(p, z, min, max);
        };
        canvas.addEventListener('wheel', zoomPan.wheelHandler);

        zoomPan.mouseDownHandler = event => {
            if (!zoomPan.callback) {
                return;
            }
            if (event.button === 1) {
                // reset min-max window
                zoomPan.callback();
                return;
            }
            if (event.shiftKey) {
                return;
            }
            if (event.button === 0 || event.button === 2) {
                const type = (event.button === 2) ? 'zoom' : 'pan';
                const { xScale } = chartInstance.scales;
                const { min, max } = xScale;
                const offsetX = event.target.getBoundingClientRect().left;
                const p = min + ((max - min) * (
                    (event.clientX - offsetX - xScale.left) / xScale.width)
                );

                zoomPan.dragStart = {
                    type,
                    p,
                    min,
                    max,
                };
            }
        };
        canvas.addEventListener('mousedown', zoomPan.mouseDownHandler);

        zoomPan.mouseMoveHandler = event => {
            if (!zoomPan.dragStart) {
                return;
            }

            const { min, max, p } = zoomPan.dragStart;
            const { xScale } = chartInstance.scales;
            const offsetX = event.target.getBoundingClientRect().left;
            const q = min + ((max - min) * (
                (event.clientX - offsetX - xScale.left) / xScale.width)
            );

            if (zoomPan.dragStart.type === 'pan') {
                zoomPan.callback(min + (p - q), max + (p - q));
                return;
            }

            const z = (wheelZoomFactor * 4) ** ((q - p) / (max - min));
            zoomPan.zoomAtOriginBy(p, z, min, max);
        };
        canvas.addEventListener('mousemove', zoomPan.mouseMoveHandler);

        zoomPan.mouseUpHandler = () => {
            zoomPan.dragStart = null;
        };
        canvas.addEventListener('mouseup', zoomPan.mouseUpHandler);
    },

    destroy(chartInstance) {
        const { zoomPan } = chartInstance;
        if (zoomPan) {
            const { canvas } = chartInstance.chart.ctx;

            canvas.removeEventListener('mousedown', zoomPan.mouseDownHandler);
            canvas.removeEventListener('mousemove', zoomPan.mouseMoveHandler);
            canvas.removeEventListener('mouseup', zoomPan.mouseUpHandler);
            canvas.removeEventListener('wheel', zoomPan.wheelHandler);

            delete chartInstance.zoomPan;
        }
    },
};
