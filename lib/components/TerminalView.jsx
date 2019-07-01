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
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const array10 = Array.from(Array(10).keys());
const scrollerStyle = { float: 'left', clear: 'both' };

const overlayProps = { transition: false, trigger: ['hover'], placement: 'top' };
const popoverTerminalInfo = (
    <Popover id="tip terminal-info">
        <p>For control characters use HEX escape: \x?? e.g. \x00 for {'<NUL>'}</p>
        <p>
            You can select any text in this command line or in the terminal view
            and <b>drag and drop</b> the selection to the macro buttons below.
        </p>
    </Popover>
);

function cancel(event) {
    event.preventDefault();
    const { dataTransfer } = event;
    dataTransfer.dropEffect = 'copy';
    return false;
}

class TerminalView extends React.Component {
    constructor(props) {
        super(props);
        this.onCommandLineSubmit = this.onCommandLineSubmit.bind(this);
        this.onSavedCommandClick = this.onSavedCommandClick.bind(this);
        this.throttleUpdates = false;
        this.state = {
            cmdLine: '',
        };
    }

    componentDidUpdate() {
        const { autoScroll } = this.props;
        if (autoScroll) {
            if (this.throttleUpdates) {
                return;
            }
            this.throttleUpdates = true;
            requestAnimationFrame(() => {
                this.throttleUpdates = false;
                this.scroller.scrollIntoView();
            });
        }
    }

    onCommandLineSubmit(event) {
        event.preventDefault();
        const { write } = this.props;
        const { cmdLine } = this.state;
        if (cmdLine.length > 0) {
            write(cmdLine);
        }
    }

    onSavedCommandClick(index) {
        const { write, commands } = this.props;
        write(commands[index]);
    }

    onSaveCommand(event, index) {
        event.preventDefault();
        const text = event.dataTransfer.getData('Text');
        const { commands, updateCommands } = this.props;
        commands[index] = text;
        updateCommands(...commands);
    }

    render() {
        const { hidden, commands } = this.props;
        const { cmdLine } = this.state;
        return (
            <div className={`terminal-view ${hidden ? 'hidden' : ''}`}>
                <div className="terminal mono">
                    {TerminalView.contentBuffer.slice()}
                    <div
                        style={scrollerStyle}
                        ref={el => { this.scroller = el; }}
                    />
                </div>
                <form onSubmit={this.onCommandLineSubmit}>
                    <Form.Group controlId="commandPrompt">
                        <InputGroup>
                            <InputGroup.Prepend>
                                <OverlayTrigger {...overlayProps} overlay={popoverTerminalInfo}>
                                    <Button variant="light">
                                        <span className="terminal-info mdi mdi-information-outline" />
                                    </Button>
                                </OverlayTrigger>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="text"
                                placeholder="Type AT command here..."
                                onChange={
                                    ({ target }) => this.setState({ cmdLine: target.value.trim() })
                                }
                            />
                            <InputGroup.Append>
                                <Button
                                    className="core-btn"
                                    type="submit"
                                    disabled={cmdLine.length === 0}
                                >
                                    Send
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </form>
                <div className="saved-commands">
                    {array10.map(index => (
                        <Button
                            variant="light"
                            className="core-btn"
                            key={index}
                            onClick={() => this.onSavedCommandClick(index)}
                            onDrop={event => this.onSaveCommand(event, index)}
                            onDragOver={cancel}
                            onDragEnter={cancel}
                            size="sm"
                            disabled={(commands[index] || '').trim().length === 0}
                        >
                            {commands[index]}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }
}

TerminalView.contentBuffer = [];

TerminalView.propTypes = {
    hidden: PropTypes.bool.isRequired,
    update: PropTypes.number.isRequired, // eslint-disable-line
    write: PropTypes.func.isRequired,
    commands: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateCommands: PropTypes.func.isRequired,
    autoScroll: PropTypes.bool.isRequired,
};

export default TerminalView;
