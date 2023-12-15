# Sample code for locationapi.org

The provided code snippet demonstrates the usage of the [locationapi.org](https://locationapi.org/) service. You can use code similar to this in a client application, for example, a mobile app, to display a map showing the location of the device.

To see an example for using the locationapi.org service, click **Show serving station location** in the side panel of LTE Link Monitor.

!!! note "Note"
      - This code only handles expected successful responses.
      - The location request can be further enhanced for better accuracy by specifying neighboring cells,
        for which you can directly use the response to the AT%NBRGRSRP command.

```javascript
const SerialPort = require('serialport');
const fetch = require('node-fetch');

const port = new SerialPort('COM8', {
    autoOpen: false,
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
});

let mcc;
let mnc;

// open the port and execute an AT+COPS? request
new Promise(resolve => port.open(resolve))
    .then(() => new Promise(resolve => {
        port.once('data', buf => resolve(buf.toString())).write('AT+COPS?\r');
    }))

    // pick the 3rd argument of COPS response
    .then(plmn => (/COPS: [0-2],[0-2],"([^"]*)"/.exec(plmn).pop()))
    .then(mccmnc => {
        mcc = parseInt(mccmnc.substring(0, 3), 10);
        mnc = parseInt(mccmnc.substring(3), 10);
    })

    // execute an AT+CEREG? request
    .then(() => new Promise(resolve => {
        port.once('data', buf => resolve(buf.toString())).write('AT+CEREG?\r');
    }))

    // pick the 3rd and 4th field from the response
    .then(registration => (/CEREG: \d,\d+,"([0-9A-F]{1,4})","([0-9A-F]{1,8})"/.exec(registration).slice(-2)))
    .then(([tac, ci]) => ({
        lac: parseInt(tac, 16),
        cid: parseInt(ci, 16),
    }))

    // construct the locationapi request
    .then(({ lac, cid }) => ({
        token: 'pk.c748a4d4e6ce0bfd5491dcfb01ba9b10',
        radio: 'lte',
        mcc,
        mnc,
        cells: [{ lac, cid }],
        address: 1,
    }))
    .then(body => console.log(body) || body)

    // fetch the result
    .then(body => fetch('https://eu1.unwiredlabs.com/v2/process.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }))
    .then(response => response.json())
    .then(console.log)
    .then(() => process.exit());
```