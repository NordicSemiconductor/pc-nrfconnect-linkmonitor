/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';

import { write } from '../actions/modemActions';
import { updateSavedCommands } from '../actions/terminalActions';
import TerminalView from '../components/TerminalView';

export default connect(
    state => ({
        update: state.app.ui.terminalUpdate,
        commands: state.app.ui.commands,
        autoScroll: state.app.ui.autoScroll,
    }),
    dispatch => ({
        write: data => write(data),
        updateCommands: (...args) => dispatch(updateSavedCommands(...args)),
    })
)(TerminalView);
