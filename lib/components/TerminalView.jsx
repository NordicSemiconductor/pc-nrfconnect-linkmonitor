/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Alert } from 'pc-nrfconnect-shared';
import PropTypes from 'prop-types';

const array10 = Array.from(Array(10).keys());
const scrollerStyle = { float: 'left', clear: 'both' };

const overlayProps = {
    transition: false,
    placement: 'top',
};
const popoverTerminalInfo = (
    <Popover id="tip terminal-info">
        <Popover.Content>
            <p>
                For control characters use HEX escape: \x?? e.g. \x00 for{' '}
                {'<NUL>'}
            </p>
            You can select any text in this command line or in the terminal view
            and <b>drag and drop</b> the selection to the macro buttons below.
        </Popover.Content>
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
        const { active, commands } = this.props;
        const { cmdLine } = this.state;
        return (
            <div className={`terminal-view ${active ? 'hidden' : ''}`}>
                <Alert variant="warning">
                    Deprecated: Use Cellular Monitor instead.
                </Alert>
                <div className="terminal mono">
                    {TerminalView.contentBuffer.slice()}
                    <div
                        style={scrollerStyle}
                        ref={el => {
                            this.scroller = el;
                        }}
                    />
                </div>
                <form onSubmit={this.onCommandLineSubmit}>
                    <Form.Group controlId="commandPrompt">
                        <InputGroup>
                            <InputGroup.Prepend>
                                <OverlayTrigger
                                    {...overlayProps}
                                    overlay={popoverTerminalInfo}
                                >
                                    <Button variant="light">
                                        <span className="terminal-info mdi mdi-information-outline" />
                                    </Button>
                                </OverlayTrigger>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="text"
                                placeholder="Type AT command here..."
                                onChange={({ target }) =>
                                    this.setState({
                                        cmdLine: target.value.trim(),
                                    })
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
                            variant="secondary"
                            className="core-btn"
                            key={index}
                            onClick={() => this.onSavedCommandClick(index)}
                            onDrop={event => this.onSaveCommand(event, index)}
                            onDragOver={cancel}
                            onDragEnter={cancel}
                            size="sm"
                            disabled={
                                (commands[index] || '').trim().length === 0
                            }
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
    active: PropTypes.bool.isRequired,
    update: PropTypes.number.isRequired,
    write: PropTypes.func.isRequired,
    commands: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateCommands: PropTypes.func.isRequired,
    autoScroll: PropTypes.bool.isRequired,
};

export default TerminalView;
