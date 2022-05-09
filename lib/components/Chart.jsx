/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { Line } from 'react-chartjs-2';
import { EventCategory } from 'modemtalk';
import PropTypes from 'prop-types';

import { timeseries } from '../actions/chartActions';
import zoomPanPlugin from '../utils/chart.zoomPan';

const greenColor = '#59a659';
const blueColor = '#0060a0';

const timestampToLabel = (microseconds, index, array) => {
    if (microseconds < 1) return undefined;

    if (index > 0 && index < array.length - 1) {
        const [first, last] = [array[0], array[array.length - 1]];
        const range = last - first;
        if (
            microseconds - first < range / 8 ||
            last - microseconds < range / 8
        ) {
            return undefined;
        }
    }
    const d = new Date(microseconds / 1e3);
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const z = Math.trunc(d.getMilliseconds() / 100) % 10;
    const time = `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(
        2,
        '0'
    )}:${`${s}`.padStart(2, '0')}.${z}`;

    if (array) {
        let date = '';
        if (index === 0 || index === array.length - 1) {
            date = d.toISOString().slice(0, 10);
        }
        return [time, date];
    }
    return time;
};

const lineDatasetOptions = {
    rsrp: { label: 'reference signal received power', unit: 'dBm' },
};

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.zoomPanCallback = this.zoomPanCallback.bind(this);
    }

    componentDidMount() {
        const { zoomPan } = this.chartInstance;
        // buggy for the first time
        zoomPan.callback = this.zoomPanCallback;
        this.mounted = true;
    }

    zoomPanCallback(begin, end) {
        const { chartWindow, chartDuration, windowDuration } = this.props;

        if (typeof begin === 'undefined') {
            chartDuration(windowDuration);
            return;
        }

        chartWindow(begin, end);
    }

    render() {
        const {
            timestamp,
            windowBegin,
            windowEnd,
            windowDuration,
            isLive,
            chartWindowReset,
            active,
            isConnected,
            openLogfile,
        } = this.props;

        const end = windowEnd || timestamp;
        const begin = windowBegin || end - windowDuration;

        const sqChart = timeseries.signalQuality;
        const d = sqChart.filter(e => e.ts >= begin && e.ts <= end);

        const datasets = Object.keys(lineDatasetOptions).map((key, i) => ({
            label: lineDatasetOptions[key].label,
            backgroundColor: `hsla(${(120 + i * 60) % 360}, 50%, 50%, 0.6)`,
            borderColor: `hsla(${(120 + i * 60) % 360}, 50%, 50%, 1)`,
            borderWidth: 1,
            fill: false,
            data: d.map(e => ({ x: e.ts, y: e[key] })),
            yAxisID: lineDatasetOptions[key].axis || 'y-dbm',
            pointStyle: 'rectRot',
            pointRadius: 5,
            pointHitRadius: 5,
            pointHoverRadius: 8,
            pointBorderWidth: 0,
            pointBorderColor: 'transparent',
            lineTension: 0.2,
            spanGaps: true,
            labelCallback: element =>
                `${lineDatasetOptions[key].label}: ${element.y} ${lineDatasetOptions[key].unit}`,
        }));

        const events = timeseries.events.filter(
            e => e.x >= begin && e.x <= end
        );
        datasets.push({
            label: 'events',
            type: 'scatter',
            yAxisID: 'y-events',
            data: events,
            fill: false,
            backgroundColor: 'rgba(0, 96, 160, 0.5)',
            borderWidth: 0,
            showLine: false,
            pointStyle: 'rectRot',
            pointRadius: 10,
            pointHitRadius: 10,
            pointHoverRadius: 15,
            labelCallback: element => {
                const label = EventCategory(element.category);
                const value = element.message;
                return `${label}: ${value}`;
            },
        });
        const chartData = {
            datasets,
        };

        const chartOptions = {
            title: {
                display: false,
            },
            maintainAspectRatio: false,
            tooltips: {
                enabled: true,
                mode: 'point',
                intersect: false,
                callbacks: {
                    title: items => timestampToLabel(items[0].xLabel),
                    label: (item, data) => {
                        const dataset = data.datasets[item.datasetIndex];
                        const element = dataset.data[item.index];
                        if (dataset.labelCallback) {
                            return dataset.labelCallback(element);
                        }
                        return `${dataset.label}: ${element.y}`;
                    },
                },
            },
            hover: {
                mode: 'point',
                intersect: false,
            },
            legend: {
                display: false,
            },
            animation: {
                duration: 0,
            },
            scales: {
                xAxes: [
                    {
                        id: 'xScale',
                        type: 'linear',
                        min: begin,
                        max: end,
                        ticks: {
                            maxRotation: 0,
                            autoSkipPadding: 25,
                            min: begin,
                            max: end,
                            callback: timestampToLabel,
                            maxTicksLimit: 7,
                        },
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                        },
                    },
                ],
                yAxes: [
                    {
                        id: 'y-dbm',
                        type: 'linear',
                        position: 'left',
                        min: -150,
                        max: -40,
                        ticks: {
                            fontColor: greenColor,
                            min: -150,
                            max: -40,
                        },
                        scaleLabel: {
                            fontColor: greenColor,
                            display: true,
                            labelString: 'dBm',
                        },
                    },
                    {
                        id: 'y-events',
                        type: 'linear',
                        position: 'right',
                        min: -1,
                        max: EventCategory.MAX + 1,
                        ticks: {
                            fontColor: blueColor,
                            min: -1,
                            max: EventCategory.MAX + 1,
                            callback: EventCategory,
                            maxTicksLimit: 15,
                            fontSize: 9,
                        },
                        gridLines: { display: false },
                    },
                ],
            },
        };

        const className = `chart signal-quality ${active ? 'hidden' : ''}`;
        return (
            <div className={className}>
                <div className="chart-top">
                    <span style={{ color: greenColor }}>SIGNAL</span>
                    <span style={{ color: blueColor }}>MODEM EVENTS</span>
                </div>
                <Line
                    ref={r => {
                        if (r) this.chartInstance = r.chartInstance;
                    }}
                    data={chartData}
                    options={chartOptions}
                    timestamp={timestamp}
                    plugins={[zoomPanPlugin]}
                />
                <div className="chart-bottom">
                    <Button
                        className="core-btn"
                        disabled={isConnected}
                        variant="primary"
                        size="sm"
                        onClick={openLogfile}
                    >
                        Open logfile
                    </Button>
                    <Button
                        className="core-btn"
                        disabled={isLive}
                        variant={isLive ? 'default' : 'primary'}
                        size="sm"
                        onClick={chartWindowReset}
                    >
                        Live Scroll
                    </Button>
                </div>
            </div>
        );
    }
}

Chart.propTypes = {
    chartWindow: PropTypes.func.isRequired,
    chartDuration: PropTypes.func.isRequired,
    chartWindowReset: PropTypes.func.isRequired,
    windowBegin: PropTypes.number.isRequired,
    windowEnd: PropTypes.number.isRequired,
    windowDuration: PropTypes.number.isRequired,
    timestamp: PropTypes.number.isRequired,
    isLive: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    openLogfile: PropTypes.func.isRequired,
};

export default Chart;
