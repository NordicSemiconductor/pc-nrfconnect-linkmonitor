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
