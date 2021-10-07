/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as hexEscape from '../hexEscape';

describe('hex escape sequence encoder and decoder', () => {
    it('should encode control characters to hex escape sequences', () => {
        expect(hexEscape.encode('\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007'))
            .toBe('\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07');
        expect(hexEscape.encode('\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F'))
            .toBe('\\x08\\x09\\x0A\\x0B\\x0C\\x0D\\x0E\\x0F');
        expect(hexEscape.encode('\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017'))
            .toBe('\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17');
        expect(hexEscape.encode('\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F'))
            .toBe('\\x18\\x19\\x1A\\x1B\\x1C\\x1D\\x1E\\x1F\\x7F');
    });
    it('should decode hex escape sequences to control characters', () => {
        expect(hexEscape.decode('\\x00\\x01\\x02\\x03\\x04\\x05\\x06\\x07'))
            .toBe('\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007');
        expect(hexEscape.decode('\\x08\\x09\\x0A\\x0B\\x0C\\x0D\\x0E\\x0F'))
            .toBe('\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F');
        expect(hexEscape.decode('\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17'))
            .toBe('\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017');
        expect(hexEscape.decode('\\x18\\x19\\x1A\\x1B\\x1C\\x1D\\x1E\\x1F\\x7F'))
            .toBe('\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F');
    });
});
