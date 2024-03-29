/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Slider from '@levshitsvv/react-rangeslider';
import { shell } from 'electron';
import { CollapsibleGroup } from 'pc-nrfconnect-shared';
import PropTypes from 'prop-types';

import '@levshitsvv/react-rangeslider/lib/index.css';

const popoverAutoRequests = (
    <Popover id="tip-autoreq" className="tip autoreq">
        <Popover.Content>
            The application automatically sends AT commands when connecting to
            the device to query the state of the modem and to subscribe to
            notifications.
        </Popover.Content>
    </Popover>
);

const popoverFlowControl = (
    <Popover id="tip-flowcontrol" className="tip flowcontrol">
        <Popover.Content>
            You must reopen the device to take effect.
        </Popover.Content>
    </Popover>
);

const popoverToken = (
    <Popover id="tip-location-api" className="tip location-api">
        <Popover.Content>
            <p>
                The Geolocation API helps developers locate IoT, M2M and other
                connected devices anywhere in the world without GPS.
            </p>
            <p>In order to use the service an access token is required.</p>
            The initial token provided here belongs to a free limited account,
            therefore you are encouraged to change it.
        </Popover.Content>
    </Popover>
);

const overlayProps = {
    placement: 'right',
    transition: false,
};

const locationApiLink = (
    <a // eslint-disable-line jsx-a11y/anchor-is-valid
        role="link"
        tabIndex={0}
        onClick={() => shell.openItem('https://locationapi.org/trial')}
        onKeyPress={() => {}}
    >
        LocationAPI
        <span className="mdi mdi-link" />
    </a>
);

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.onCommandLineSubmit = this.onCommandLineSubmit.bind(this);
        this.onSliderValueChange = this.onSliderValueChange.bind(this);
    }

    onCommandLineSubmit(event) {
        event.preventDefault();
        const { apiTokenUpdate } = this.props;
        const { value } = this.inputNode;
        if (value) {
            apiTokenUpdate(value);
        }
    }

    onSliderValueChange(value) {
        const { signalQualityIntervalChanged } = this.props;
        signalQualityIntervalChanged(value);
    }

    render() {
        const {
            autoScroll,
            autoScrollToggled,
            flowControl,
            flowControlToggled,
            apiToken,
            autoRequests,
            autoRequestsToggled,
            signalQualityInterval,
            autoDeviceFilter,
            autoDeviceFilterToggled,
        } = this.props;
        return (
            <CollapsibleGroup
                className="settings"
                heading="Settings"
                defaultCollapsed={false}
            >
                <OverlayTrigger {...overlayProps} overlay={popoverAutoRequests}>
                    <Form.Group controlId="autoReqCheck">
                        <Form.Check
                            type="checkbox"
                            onChange={e =>
                                autoRequestsToggled(e.target.checked)
                            }
                            checked={autoRequests}
                            label="Automatic requests"
                        />
                    </Form.Group>
                </OverlayTrigger>
                <Form.Group controlId="autoScrollCheck">
                    <Form.Check
                        type="checkbox"
                        onChange={e => autoScrollToggled(e.target.checked)}
                        checked={autoScroll}
                        label="Terminal auto scroll"
                    />
                </Form.Group>
                <OverlayTrigger {...overlayProps} overlay={popoverFlowControl}>
                    <Form.Group controlId="flowControlCheck">
                        <Form.Check
                            type="checkbox"
                            onChange={e => flowControlToggled(e.target.checked)}
                            checked={flowControl}
                            label="Flow control"
                        />
                    </Form.Group>
                </OverlayTrigger>
                Periodic signal quality request{' '}
                {signalQualityInterval > 0
                    ? `${signalQualityInterval}s`
                    : 'off'}
                <div className="slider-container">
                    <span>off</span>
                    <Slider
                        min={0}
                        max={30}
                        value={signalQualityInterval}
                        // labels={{ 0: 'off', 30: '30s' }}
                        // format={n => (n === 0 ? 'off' : `${n}s`)}
                        onChange={this.onSliderValueChange}
                        tooltip={false}
                    />
                    <span>30s</span>
                </div>
                <hr />
                <Form onSubmit={this.onCommandLineSubmit}>
                    <OverlayTrigger {...overlayProps} overlay={popoverToken}>
                        <Form.Group controlId="commandPrompt">
                            <Form.Label>{locationApiLink} token</Form.Label>
                            <Form.Control
                                ref={node => {
                                    this.inputNode = node;
                                }}
                                type="text"
                                value={apiToken}
                                onChange={this.onCommandLineSubmit}
                            />
                        </Form.Group>
                    </OverlayTrigger>
                </Form>
                <hr />
                <Form.Group controlId="portFilterCheck">
                    <Form.Check
                        type="checkbox"
                        onChange={e =>
                            autoDeviceFilterToggled(e.target.checked)
                        }
                        checked={autoDeviceFilter}
                        label="Show only supported devices"
                    />
                </Form.Group>
            </CollapsibleGroup>
        );
    }
}

Settings.propTypes = {
    autoScroll: PropTypes.bool.isRequired,
    autoScrollToggled: PropTypes.func.isRequired,
    flowControlToggled: PropTypes.func.isRequired,
    flowControl: PropTypes.bool.isRequired,
    apiToken: PropTypes.string.isRequired,
    apiTokenUpdate: PropTypes.func.isRequired,
    autoRequests: PropTypes.bool.isRequired,
    autoRequestsToggled: PropTypes.func.isRequired,
    signalQualityInterval: PropTypes.number.isRequired,
    signalQualityIntervalChanged: PropTypes.func.isRequired,
    autoDeviceFilter: PropTypes.bool.isRequired,
    autoDeviceFilterToggled: PropTypes.func.isRequired,
};

export default Settings;
