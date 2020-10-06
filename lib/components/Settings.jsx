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
import { shell } from 'electron';

import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

const popoverAutoRequests = (
    <Popover id="tip-autoreq" className="tip autoreq">
        <p>
            The application automatically sends AT commands when connecting to the
            device to query the state of the modem and to subscribe to notifications.
        </p>
    </Popover>
);

const popoverFlowControl = (
    <Popover id="tip-flowcontrol" className="tip flowcontrol">
        <p>You must reopen the device to take effect.</p>
    </Popover>
);

const popoverToken = (
    <Popover id="tip-location-api" className="tip location-api">
        <p>
            The Geolocation API helps developers locate IoT, M2M and other
            connected devices anywhere in the world without GPS.
        </p>
        <p>In order to use the service an access token is required.</p>
        <p>
            The initial token provided here belongs to a free limited
            account, therefore you are encouraged to change it.
        </p>
    </Popover>
);

const overlayProps = { trigger: ['hover'], placement: 'left', transition: false };

const locationApiLink = (
    <a // eslint-disable-line jsx-a11y/anchor-is-valid
        role="link"
        tabIndex={0}
        onClick={() => shell.openItem('https://locationapi.org/trial')}
        onKeyPress={() => {}}
    >
        LocationAPI<span className="mdi mdi-link" />
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
            autoScroll, autoScrollToggled,
            flowControl, flowControlToggled,
            apiToken,
            autoRequests, autoRequestsToggled,
            signalQualityInterval,
            autoDeviceFilter, autoDeviceFilterToggled,
        } = this.props;
        return (
            <Accordion className="settings" defaultActiveKey="1">
                <Card header="Settings">
                    <Card.Header>
                        <Accordion.Toggle as={Button} variant="link" eventKey="1">
                            Settings
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="1">
                        <Card.Body>
                            <OverlayTrigger {...overlayProps} overlay={popoverAutoRequests}>
                                <Form.Group controlId="autoReqCheck">
                                    <Form.Check
                                        type="checkbox"
                                        onChange={e => autoRequestsToggled(e.target.checked)}
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
                            Periodic signal quality request {signalQualityInterval > 0 ? `${signalQualityInterval}s` : 'off'}
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
                                            ref={node => { this.inputNode = node; }}
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
                                    onChange={e => autoDeviceFilterToggled(e.target.checked)}
                                    checked={autoDeviceFilter}
                                    label="Auto device/port filter"
                                />
                            </Form.Group>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
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
