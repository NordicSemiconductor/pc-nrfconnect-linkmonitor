/* Copyright (c) 2015 - 2019, Nordic Semiconductor ASA
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

import React, { useState } from 'react';
import {
    bool, func, string, shape,
} from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';

import { remote } from 'electron';
import { homedir } from 'os';
import { readFileSync } from 'fs';
import { logger } from 'nrfconnect/core';

const TextAreaGroup = ({
    controlId, controlProps, label, value, set, clearLabel, clear, setClear,
}) => (
    <Form.Group as={Row} controlId={controlId}>
        <Col xs={11}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                {...controlProps}
                value={value}
                onChange={({ target }) => set(target.value)}
                disabled={clear}
            />
        </Col>
        <Col xs={1} className="pl-0">
            <Form.Label>{clearLabel}&nbsp;</Form.Label>
            <Form.Check
                type="checkbox"
                aria-label="Delete"
                checked={clear}
                onChange={({ target }) => setClear(target.checked)}
            />
        </Col>
    </Form.Group>
);
TextAreaGroup.propTypes = {
    controlId: string.isRequired,
    controlProps: shape({}).isRequired,
    label: string.isRequired,
    value: string.isRequired,
    set: func.isRequired,
    clearLabel: string,
    clear: bool.isRequired,
    setClear: func.isRequired,
};
TextAreaGroup.defaultProps = {
    clearLabel: null,
};

const CertificateManagerView = ({ hidden, writeTLSCredential, deleteTLSCredential }) => {
    const [caCert, setCACert] = useState('');
    const [clientCert, setClientCert] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [preSharedKey, setPreSharedKey] = useState('');
    const [pskIdentity, setPskIdentity] = useState('');
    const [clearCaCert, setClearCACert] = useState(false);
    const [clearClientCert, setClearClientCert] = useState(false);
    const [clearPrivateKey, setClearPrivateKey] = useState(false);
    const [clearPreSharedKey, setClearPreSharedKey] = useState(false);
    const [clearPskIdentity, setClearPskIdentity] = useState(false);
    const [secTag, setSecTag] = useState(16842753);
    const [showWarning, setShowWarning] = useState(false);

    function loadJsonFile(filename) {
        if (!filename) {
            return;
        }
        try {
            const json = JSON.parse(readFileSync(filename, 'utf8'));
            setCACert(json.caCert || '');
            setClientCert(json.clientCert || '');
            setPrivateKey(json.privateKey || '');
        } catch (err) {
            logger.error(err.message);
        }
    }

    function selectJsonFile() {
        const [filename] = remote.dialog.showOpenDialog({
            defaultPath: homedir(),
            properties: ['openFile'],
        }) || [];
        loadJsonFile(filename);
    }

    function onDragOver(event) {
        const ev = event;
        ev.dataTransfer.dropEffect = 'copy';
        ev.preventDefault();
    }

    function onDrop(event) {
        const file = event.dataTransfer.files[0] || {};
        loadJsonFile(file.path);
        event.preventDefault();
    }

    async function performCertificateUpdate() {
        setShowWarning(false);

        async function oneUpdate(info, type, content, clear) {
            if (clear) {
                logger.info(`Clearing ${info}...`);
                try {
                    await deleteTLSCredential(secTag, type);
                } catch (err) {
                    logger.error(err.message);
                }
            } else if (content) {
                logger.info(`Updating ${info}...`);
                try {
                    await writeTLSCredential(secTag, type, content);
                } catch (err) {
                    logger.error(err.message);
                }
            }
        }
        await oneUpdate('CA certificate', 0, caCert, clearCaCert);
        await oneUpdate('client certificate', 1, clientCert, clearClientCert);
        await oneUpdate('private key', 2, privateKey, clearPrivateKey);
        await oneUpdate('pre-shared key', 3, preSharedKey, clearPreSharedKey);
        await oneUpdate('PSK identity', 4, pskIdentity, clearPskIdentity);

        logger.info('Certificate update completed');
    }

    function updateCertificate() {
        if (clearCaCert || clearClientCert || clearPrivateKey
            || clearPreSharedKey || clearPskIdentity) {
            return setShowWarning(true);
        }
        return performCertificateUpdate();
    }

    const className = 'cert-mgr-view d-flex flex-column p-5 h-100 pretty-scrollbar';
    const textAreaProps = {
        as: 'textarea',
        className: 'text-monospace',
        rows: 4,
    };
    const textProps = { type: 'text' };

    return (
        <div
            className={`${className} ${hidden ? 'hidden' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Alert variant="info" style={{ userSelect: 'text' }}>
                <span className="float-left mdi mdi-information mdi-36px pr-3" />
                The modem must be in <strong>offline</strong> state
                (<code>AT+CFUN=4</code>) for updating certificates.<br />
                You can drag-and-drop a JSON file over this window.<br />
                You can use <code>AT%CMNG=1</code> command in the
                Terminal screen to list all stored certificates.
            </Alert>
            <Form className="mt-4 mb-4">
                <Row>
                    <Col xs={8}>
                        {TextAreaGroup({
                            controlId: 'certMgr.caCert',
                            controlProps: textAreaProps,
                            label: 'CA certificate',
                            value: caCert,
                            set: setCACert,
                            clearLabel: 'Delete',
                            clear: clearCaCert,
                            setClear: setClearCACert,
                        })}
                        {TextAreaGroup({
                            controlId: 'certMgr.clientCert',
                            controlProps: textAreaProps,
                            label: 'Client certificate',
                            value: clientCert,
                            set: setClientCert,
                            clear: clearClientCert,
                            setClear: setClearClientCert,
                        })}
                        {TextAreaGroup({
                            controlId: 'certMgr.privKey',
                            controlProps: textAreaProps,
                            label: 'Private key',
                            value: privateKey,
                            set: setPrivateKey,
                            clear: clearPrivateKey,
                            setClear: setClearPrivateKey,
                        })}
                    </Col>
                    <Col xs={4}>
                        {TextAreaGroup({
                            controlId: 'certMgr.preSharedKey',
                            controlProps: textProps,
                            label: 'Pre-shared key',
                            value: preSharedKey,
                            set: setPreSharedKey,
                            clearLabel: 'Delete',
                            clear: clearPreSharedKey,
                            setClear: setClearPreSharedKey,
                        })}
                        {TextAreaGroup({
                            controlId: 'certMgr.pskIdentity',
                            controlProps: textProps,
                            label: 'PSK identity',
                            value: pskIdentity,
                            set: setPskIdentity,
                            clear: clearPskIdentity,
                            setClear: setClearPskIdentity,
                        })}
                        <Form.Group as={Row} controlId="certMgr.secTag" className="mt-5">
                            <Form.Label column>Security tag</Form.Label>
                            <Col md="auto">
                                <Form.Control
                                    type="text"
                                    value={secTag}
                                    onChange={({ target }) => setSecTag(Number(target.value))}
                                />
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <ButtonGroup className="align-self-end">
                <Button
                    variant="outline-secondary"
                    className="mr-2"
                    onClick={selectJsonFile}
                >
                    Load from JSON
                </Button>
                <Button
                    variant="primary"
                    onClick={updateCertificate}
                >
                    Update certificates
                </Button>
            </ButtonGroup>

            <Modal show={showWarning} onHide={() => setShowWarning(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are about to delete credentials, are you sure to proceed?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowWarning(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={performCertificateUpdate}>
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

CertificateManagerView.propTypes = {
    hidden: bool.isRequired,
    writeTLSCredential: func.isRequired,
    deleteTLSCredential: func.isRequired,
};

export default CertificateManagerView;
