# LTE Link Monitor

[![Build Status](https://dev.azure.com/NordicSemiconductor/Wayland/_apis/build/status/NordicSemiconductor.pc-nrfconnect-linkmonitor?branchName=master)](https://dev.azure.com/NordicSemiconductor/Wayland/_build/latest?definitionId=6&branchName=master)
[![License](https://img.shields.io/badge/license-Modified%20BSD%20License-blue.svg)](LICENSE)

The LTE Link Monitor is a modem client application that monitors the modem/link status and activity via AT commands. It is implemented as an app for the [nRF Connect](https://infocenter.nordicsemi.com/topic/struct_nrftools/struct/nrftools_nrfconnect.html) desktop application. Currently the nRF9160 Development Kit (PCA10090) is the only supported device.

# Installation

To install the application you can download binaries from the [nRF Connect product page](https://www.nordicsemi.com/eng/Products/Bluetooth-low-energy/nRF-Connect-for-desktop) on Nordic Semiconductor web pages.

nRF Connect currently supports the following operating systems:

* Windows
* Ubuntu Linux 64-bit
* macOS

After *nRF Connect* is installed, you can find *Link Monitor* in the app list by selecting *Add/remove apps*.

# Usage documentation

See [user guide](https://infocenter.nordicsemi.com/topic/ug_link_monitor/UG/link_monitor/lm_intro.html).

# Contributing

Feel free to file code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor/issues) and/or submit a pull request. In order to accept your pull request, we need you to sign our Contributor License Agreement (CLA). You will see instructions for doing this after having submitted your first pull request. You only need to sign the CLA once, so if you have already done it for another project in the NordicSemiconductor organization, you are good to go.

# Compiling from source

Since *nRF Connect* expects local apps in `$HOME/.nrfconnect-apps/local` (Linux/macOS) or `%USERPROFILE%/.nrfconnect-apps/local` (Windows) directory, make sure your repository is cloned or linked there.

## Dependencies

To build this project you will need to install the following tools:

* Node.js (>=6.9)
* npm (>=3.7.0)

## Compiling

When *nRF Connect* have been installed, you are ready to start the compilation. Run the following command from the command line, standing in the root folder of the repository:

    npm install

When the procedure has completed successfully you can run the application by running:

    npm run dev

The built app can be loaded by *nRF Connect* launcher.

## Testing

Unit testing can be performed by running:

    npm test

# License

See the [license file](LICENSE) for details.

# Feedback

* Ask questions on [DevZone Questions](https://devzone.nordicsemi.com)
* File code related issues on [GitHub Issues](https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor/issues)
