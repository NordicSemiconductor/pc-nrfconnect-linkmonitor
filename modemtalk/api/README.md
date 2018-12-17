## Extending the `ModemPort` api

All javascript files in this directory will be require()'d and tested for exporting a function which takes the ModemPort object as argument.

You can extend ModemPort following this example:

    module.exports = target => {

        // register a converter function that translates an AT response
        // to an object which will be emitted in case of
        // unsolicited result codes:
        target.prototype.registerConverter(prefix, line => {
            return {
                ...
            };
        });

        // creating new methods:
        Object.assign(target.prototype, {
            setMyCommand(...arg) {
                // return a Promise (ModemPort.write() returns a Promise)
                return this.writeAT(`+COMMAND=${args.join(',')}`, {
                    expect: /.*/,
                    processor: lines => {
                        return ...; // will be the value of resolve()
                    }
                });
            },
        });
    }
