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

import { EventCategory } from '../utils';

const CredentialType = {
    ROOT_CA_CERTIFICATE: 0,
    CLIENT_CERTIFICATE: 1,
    CLIENT_PRIVATE_KEY: 2,
    PRE_SHARED_KEY: 3,
    PSK_IDENTITY: 4,
    0: 'Root CA Certificate',
    1: 'Client Certificate',
    2: 'Client Private Key',
    3: 'Pre-shared Key',
    4: 'PSK Identity',
};

// Response syntax for read operation:
// %CMNG: <sec_tag>,<type>[,<sha>[,<content>]]
// Response syntax for list operation:
// %CMNG: <sec_tag>,<type>[,<sha>]
const expect = /%CMNG: ?([0-9]+), ?([0-4])(?:, ?"(.*?)")?(?:, ?"((.|[\r\n])*?)")?/;

function convertResponse(resp) {
    const match = expect.exec(resp);
    if (match) {
        const [, secTagStr, typeStr, sha, content] = match;
        const secTag = parseInt(secTagStr, 10);
        const type = parseInt(typeStr, 10);
        let message = `${CredentialType[type]} (${secTag})`;
        if (sha) {
            message = `${message}: ${sha}`;
        }
        return {
            id: 'TLSCredential',
            secTag,
            type,
            sha,
            content,
            message,
            category: EventCategory.PACKET_DOMAIN,
        };
    }
    return undefined;
}

module.exports = target => {
    target.prototype.registerConverter('%CMNG', convertResponse);

    Object.assign(target.prototype, {
        CredentialType,
        writeTLSCredential(secTag, type, content, password) {
            let cmd = `%CMNG=0,${secTag},${type},"${content.trim()}"`;
            if (password !== undefined) {
                cmd = `${cmd},${password}`;
            }
            return this.writeAT(cmd, {
                expect,
                processor: lines => convertResponse(lines.pop()),
                timeout: 5000,
            });
        },
        listTLSCredentials(secTag, type) {
            let cmd = '%CMNG=1';
            if (secTag !== undefined) {
                cmd = `${cmd},${secTag}`;
            }
            if (type !== undefined) {
                cmd = `${cmd},${type}`;
            }
            return this.writeAT(cmd, {
                expect,
                processor: lines => convertResponse(lines.pop()),
            });
        },
        readTLSCredential(secTag, type) {
            return this.writeAT(`%CMNG=2,${secTag},${type}`, {
                expect,
                processor: lines => convertResponse(lines.pop()),
            });
        },
        deleteTLSCredential(secTag, type) {
            return this.writeAT(`%CMNG=3,${secTag},${type}`);
        },
    });
};
