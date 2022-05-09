/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { dialog } from '@electron/remote';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { logger } from 'pc-nrfconnect-shared';
import { bool, func, shape, string } from 'prop-types';

import {
    deleteTLSCredential,
    writeTLSCredential,
} from '../actions/modemActions';

const NRF_CLOUD_TAG = 16842753;

const FormGroupWithCheckbox = ({
    controlId,
    controlProps,
    label,
    value,
    set,
    clearLabel,
    clear,
    setClear,
    subText,
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
            {subText && <Form.Text className="text-muted">{subText}</Form.Text>}
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
FormGroupWithCheckbox.propTypes = {
    controlId: string.isRequired,
    controlProps: shape({}).isRequired,
    label: string.isRequired,
    value: string.isRequired,
    set: func.isRequired,
    clearLabel: string,
    clear: bool.isRequired,
    setClear: func.isRequired,
    subText: string,
};
FormGroupWithCheckbox.defaultProps = {
    clearLabel: null,
    subText: null,
};

const CertificateManagerView = ({ active }) => {
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
    const [secTag, setSecTag] = useState(NRF_CLOUD_TAG);
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

    const selectJsonFile = async () => {
        const {
            filePaths: [filename],
        } =
            (await dialog.showOpenDialog({
                defaultPath: homedir(),
                properties: ['openFile'],
            })) || [];
        loadJsonFile(filename);
    };

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

    const performCertificateUpdate = async () => {
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
    };

    const updateCertificate = () => {
        if (
            clearCaCert ||
            clearClientCert ||
            clearPrivateKey ||
            clearPreSharedKey ||
            clearPskIdentity
        ) {
            return setShowWarning(true);
        }
        return performCertificateUpdate();
    };

    const className =
        'cert-mgr-view d-flex flex-column p-4 h-100 overflow-auto pretty-scrollbar';
    const textAreaProps = {
        as: 'textarea',
        className: 'text-monospace',
        rows: 4,
    };
    const textProps = { type: 'text' };

    return (
        <div
            className={`${className} ${active ? 'hidden' : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Alert variant="info">
                <span className="float-left h-100 mdi mdi-information mdi-36px pr-3" />
                <div style={{ lineHeight: '1.5rem', userSelect: 'text' }}>
                    The modem must be in <strong>offline</strong> state (
                    <code>AT+CFUN=4</code>) for updating certificates.
                    <br />
                    You can drag-and-drop a JSON file over this window.
                    <br />
                    You can use <code>AT%CMNG=1</code> command in the Terminal
                    screen to list all stored certificates.
                    <br />
                    Make sure your device runs a firmware with increased buffer
                    to support long AT-commands.
                    <br />
                    Use security tag <code>{NRF_CLOUD_TAG}</code> to manage nRF
                    Connect for Cloud certificate, otherwise pick a different
                    tag.
                </div>
            </Alert>
            <Form className="mt-4 mb-4 pr-4">
                <Row>
                    <Col xs={8}>
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.caCert',
                            controlProps: textAreaProps,
                            label: 'CA certificate',
                            value: caCert,
                            set: setCACert,
                            clearLabel: 'Delete',
                            clear: clearCaCert,
                            setClear: setClearCACert,
                        })}
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.clientCert',
                            controlProps: textAreaProps,
                            label: 'Client certificate',
                            value: clientCert,
                            set: setClientCert,
                            clear: clearClientCert,
                            setClear: setClearClientCert,
                        })}
                        {FormGroupWithCheckbox({
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
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.preSharedKey',
                            controlProps: textProps,
                            label: 'Pre-shared key',
                            value: preSharedKey,
                            set: setPreSharedKey,
                            clearLabel: 'Delete',
                            clear: clearPreSharedKey,
                            setClear: setClearPreSharedKey,
                            subText: 'ASCII text in hexadecimal string format',
                        })}
                        {FormGroupWithCheckbox({
                            controlId: 'certMgr.pskIdentity',
                            controlProps: textProps,
                            label: 'PSK identity',
                            value: pskIdentity,
                            set: setPskIdentity,
                            clear: clearPskIdentity,
                            setClear: setClearPskIdentity,
                        })}
                        <Form.Group
                            as={Row}
                            controlId="certMgr.secTag"
                            className="mt-5"
                        >
                            <Form.Label column>Security tag</Form.Label>
                            <Col md="auto">
                                <Form.Control
                                    type="text"
                                    value={secTag}
                                    onChange={({ target }) =>
                                        setSecTag(Number(target.value))
                                    }
                                />
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <ButtonGroup className="align-self-end">
                <Button
                    variant="secondary"
                    className="mr-2"
                    onClick={selectJsonFile}
                >
                    Load from JSON
                </Button>
                <Button variant="primary" onClick={updateCertificate}>
                    Update certificates
                </Button>
            </ButtonGroup>

            <Modal show={showWarning} onHide={() => setShowWarning(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You are about to delete credentials, are you sure to
                    proceed?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowWarning(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={performCertificateUpdate}
                    >
                        Proceed
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

CertificateManagerView.propTypes = {
    active: bool.isRequired,
};

export default CertificateManagerView;
