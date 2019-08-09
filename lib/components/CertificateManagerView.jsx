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
import { bool, func } from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { remote } from 'electron';
import { homedir } from 'os';
import { readFileSync } from 'fs';
import { logger } from 'nrfconnect/core';

const CertificateManagerView = ({ hidden, writeTLSCredential }) => {
    const [caCert, setCACert] = useState('');
    const [clientCert, setClientCert] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [secTag, setSecTag] = useState(16842753);

    function loadJsonFile(filename) {
        if (!filename) {
            return;
        }
        try {
            const json = JSON.parse(readFileSync(filename, 'utf8'));
            setCACert(json.caCert);
            setClientCert(json.clientCert);
            setPrivateKey(json.privateKey);
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

    async function updateCertificate() {
        try {
            logger.info('Updating CA certificate...');
            await writeTLSCredential(secTag, 0, caCert);
            logger.info('Updating client certificate...');
            await writeTLSCredential(secTag, 1, clientCert);
            logger.info('Updating private key...');
            await writeTLSCredential(secTag, 2, privateKey);
            logger.info('Certificate update completed successfully');
        } catch (err) {
            logger.error(err.message);
        }
    }

    const className = 'cert-mgr-view d-flex flex-column p-5 h-100 pretty-scrollbar';
    const textAreaProps = {
        as: 'textarea',
        className: 'text-monospace',
        rows: 4,
    };

    return (
        <div
            className={`${className} ${hidden ? 'hidden' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Alert variant="info">
                The modem must be in <strong>offline</strong> state
                (<code>AT+CFUN=4</code>) for updating certificates.
                You can drag-and-drop a JSON file over this window.
            </Alert>
            <Form className="mt-4 mb-4">
                <Form.Group controlId="certMgr.caCert">
                    <Form.Label>CA certificate</Form.Label>
                    <Form.Control
                        {...textAreaProps}
                        value={caCert}
                        onChange={({ target }) => setCACert(target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="certMgr.clientCert">
                    <Form.Label>Client certificate</Form.Label>
                    <Form.Control
                        {...textAreaProps}
                        value={clientCert}
                        onChange={({ target }) => setClientCert(target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="certMgr.privKey">
                    <Form.Label>Private key</Form.Label>
                    <Form.Control
                        {...textAreaProps}
                        value={privateKey}
                        onChange={({ target }) => setPrivateKey(target.value)}
                    />
                </Form.Group>
                <Form.Group as={Row} controlId="certMgr.secTag">
                    <Form.Label column sm="2">Security tag</Form.Label>
                    <Col sm="4">
                        <Form.Control
                            type="text"
                            value={secTag}
                            onChange={({ target }) => setSecTag(Number(target.value))}
                        />
                    </Col>
                </Form.Group>
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
        </div>
    );
};

CertificateManagerView.propTypes = {
    hidden: bool.isRequired,
    writeTLSCredential: func.isRequired,
};

export default CertificateManagerView;
