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
import {
    Accordion, Checkbox, ControlLabel, Panel, FormGroup, InputGroup,
    FormControl, Popover, OverlayTrigger, Glyphicon,
} from 'react-bootstrap';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

const popoverAutoRequests = (
    <Popover id="tip-location-api" className="tip location-api">
        <p>The application automatically sends AT commands when connecting to the
        device to query the state of the modem and to subscribe to notifications.</p>
    </Popover>
);

const popoverToken = (
    <Popover id="tip-location-api" className="tip location-api">
        <p>The Geolocation API helps developers locate IoT, M2M and other
        connected devices anywhere in the world without GPS.</p>
        <p>In order to use the service an access token is required.</p>
        <p>The initial token provided here belongs to a free limited
        account, therefore you are encouraged to change it.</p>
    </Popover>
);

const overlayProps = { trigger: ['hover'], placement: 'left', animation: false };

const locationApiLink = (
    <a
        role="link"
        tabIndex={0}
        onClick={() => shell.openItem('https://locationapi.org/trial')}
    >LocationAPI<Glyphicon glyph="link" /></a>
);

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.onCommandLineSubmit = this.onCommandLineSubmit.bind(this);
        this.onSliderValueChange = this.onSliderValueChange.bind(this);
    }
    onCommandLineSubmit(event) {
        event.preventDefault();
        if (this.inputNode.value) {
            this.props.apiTokenUpdate(this.inputNode.value);
        }
    }
    onSliderValueChange(value) {
        this.props.signalQualityIntervalChanged(value);
    }
    render() {
        const {
            autoScroll, autoScrollToggled,
            apiToken,
            autoRequests, autoRequestsToggled,
            signalQualityInterval,
        } = this.props;
        return (
            <Accordion className="settings" defaultActiveKey="1">
                <Panel header="Settings" eventKey="1" defaultExpanded>
                    <OverlayTrigger {...overlayProps} overlay={popoverAutoRequests}>
                        <Checkbox
                            onChange={e => autoRequestsToggled(e.target.checked)}
                            checked={autoRequests}
                        >
                            Automatic requests
                        </Checkbox>
                    </OverlayTrigger>
                    <Checkbox
                        onChange={e => autoScrollToggled(e.target.checked)}
                        checked={autoScroll}
                    >
                        Terminal auto scroll
                    </Checkbox>
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
                    <form onSubmit={this.onCommandLineSubmit}>
                        <OverlayTrigger {...overlayProps} overlay={popoverToken}>
                            <FormGroup controlId="commandPrompt">
                                <InputGroup>
                                    <ControlLabel>{locationApiLink} token</ControlLabel>
                                    <FormControl
                                        inputRef={node => { this.inputNode = node; }}
                                        type="text"
                                        value={apiToken}
                                        onChange={this.onCommandLineSubmit}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </OverlayTrigger>
                    </form>
                </Panel>
            </Accordion>
        );
    }
}

Settings.propTypes = {
    autoScroll: PropTypes.bool.isRequired,
    autoScrollToggled: PropTypes.func.isRequired,
    apiToken: PropTypes.string.isRequired,
    apiTokenUpdate: PropTypes.func.isRequired,
    autoRequests: PropTypes.bool.isRequired,
    autoRequestsToggled: PropTypes.func.isRequired,
    signalQualityInterval: PropTypes.number.isRequired,
    signalQualityIntervalChanged: PropTypes.func.isRequired,
};

export default Settings;
