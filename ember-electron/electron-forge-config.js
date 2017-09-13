const path = require('path');

function getSigningCert() {
    if (process.platform !== 'win32') {
        return;
    }

    if (process.env.CODESIGN_CERTIFICATE) {
        return process.env.CODESIGN_CERTIFICATE;
    } else {
        console.log('Codesigning certificate can not be found, release build will fail');
        console.log('To fix, set CODESIGN_CERTIFICATE');
    }
}

function getSigningPassword() {
    if (process.platform !== 'win32') {
        return;
    }

    if (process.env.CODESIGN_PASSWORD) {
        return process.env.CODESIGN_PASSWORD;
    } else {
        console.log('Codesigning password can not be found, release build will fail');
        console.log('To fix, set CODESIGN_PASSWORD');
    }
}

module.exports = {
    make_targets: {
        win32: ['squirrel'],
        darwin: ['zip', 'dmg'],
        linux: ['deb']
    },
    electronPackagerConfig: {
        appCategoryType: 'public.app-category.productivity',
        appCopyright: 'Copyright (c) 2016-2017 Ghost Foundation',
        name: 'Ghost',
        versionString: {
            CompanyName: 'Ghost Foundation',
            FileDescription: 'Ghost for Desktops',
            ProductName: 'Ghost',
            InternalName: 'Ghost'
        },
        protocols: [
            {
                name: 'Ghost Desktop',
                schemes: ['ghost']
            }
        ],
        protocol: ['ghost'],
        protocolName: 'Ghost Desktop',
        overwrite: true,
        icon: 'assets/icons/ghost'
    },
    electronInstallerDMG: {
        title: 'Ghost',
        background: 'assets/dmg/installer_background.png',
        icon: 'assets/icons/ghost.icns',
        iconsize: 100,
        window: {
            size: {
                width: 600,
                height: 571
            }
        }
    },
    electronWinstallerConfig: {
        name: 'Ghost',
        icon: 'assets/icons/ghost',
        noMsi: true,
        authors: 'Ghost Foundation',
        exe: 'Ghost.exe',
        iconUrl: `https://raw.githubusercontent.com/TryGhost/Ghost-Desktop/master/assets/icons/ghost.ico`,
        setupIcon: path.join(__dirname, '../assets/icons/ghost.ico'),
        title: 'Ghost',
        noMsi: true,
        loadingGif: path.join(__dirname, '../assets/win/installer-dev.gif'),
        certificateFile: getSigningCert(),
        certificatePassword: getSigningPassword()
    },
    electronInstallerDebian: {
        name: 'Ghost',
        maintainer: 'Felix Rieseberg <felix@felixrieseberg.com>',
        homepage: 'https://ghost.org/',
        genericName: 'Blogging Software',
        arch: 'amd64',
        icon:  path.join(__dirname, '../assets/icons/ghost-macos.png'),
        bin: 'Ghost',
        productName: 'Ghost Desktop',
        productDescription: 'A beautiful desktop application enabling you to easily manage multiple Ghost blogs and work without distractions.',
        section: 'Office',
        categories: [
            'Network', 'Office'
        ]
    },
    electronInstallerRedhat: {}
};
