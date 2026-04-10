const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

// ═══════════════════════════════════════════════════════════
// 🎵 YouTube Complete Download Methods – Automatic Installer
// Termux, Ubuntu, VPS, Windows(WSL), macOS
// ═══════════════════════════════════════════════════════════

// Color functions
const log = {
    info: (msg) => console.log(`${chalk.cyan('ℹ')} ${msg}`),
    success: (msg) => console.log(`${chalk.green('✓')} ${msg}`),
    error: (msg) => console.log(`${chalk.red('✗')} ${msg}`),
    warn: (msg) => console.log(`${chalk.yellow('⚠')} ${msg}`),
    header: (msg) => console.log(`\n${chalk.bold.blue('═══════════════════════════════════')}\n${chalk.bold.cyan(msg)}\n${chalk.bold.blue('═══════════════════════════════════')}\n`)
};

// 🎵 YouTube Download Methods Package List (53+ methods - 2026 upgrade)
const YOUTUBE_METHODS = {
    'yt-dlp': {
        packages: ['yt-dlp', 'python3'],
        methods: [
            'Default (best)', 'Android Client', 'WEB Mobile (mweb)', 'WEB Creator',
            'TV Embedded', 'iOS Client', 'VR Client', 'Studio Client',
            'android_music', 'android_creator', 'android_testsuite',
            'ios_music', 'tv', 'web_embedded', 'mediaconnect'
        ]
    },
    'youtube-dl': {
        packages: ['youtube-dl', 'python3'],
        methods: ['Python executable', 'Direct URL', 'Legacy mode', 'No-cookie mode']
    },
    'ffmpeg': {
        packages: ['ffmpeg'],
        methods: ['Direct stream extraction', 'libmp3lame encode', 'AAC->MP3', 'batch convert']
    },
    'spotifydl': {
        packages: ['spotifydl'],
        methods: ['Spotify streaming']
    },
    'curl': {
        packages: ['curl'],
        methods: ['HTTP streaming', 'pipe to ffmpeg']
    },
    'wget': {
        packages: ['wget'],
        methods: ['Direct download', 'pipe to ffmpeg']
    },
    'aria2c': {
        packages: ['aria2'],
        methods: ['Multi-thread download']
    },
    'sox': {
        packages: ['sox'],
        methods: ['Audio format conversion (nmd_axis fallback)']
    },
    'node-fetch': {
        packages: [],
        methods: [
            'cobalt API (17+ instances)',
            'invidious API (12+ instances)',
            'rapidapi-mp36', 'rapidapi-ytstream',
            'cnvmp3', 'ezmp3', 'yt1s', 'loader.to', 'tomp3.cc',
            'savefrom', 'notube', 'ymp4', 'converto',
            'mp3clan', 'ytbsave', 'ssyoutube'
        ]
    }
};

// Detect OS type
function detectOS() {
    const platform = os.platform();
    const release = os.release();

    // ── Termux (Android) ──────────────────────────────────────
    const isTermux =
        process.env.PREFIX?.includes('com.termux') ||
        fs.existsSync('/data/data/com.termux') ||
        fs.existsSync('/data/data/com.termux/files/usr/bin/pkg') ||
        fs.existsSync('/system/build.prop');

    if (isTermux) {
        return { type: 'termux', display: 'Termux (Android)', pm: 'pkg', pmAlternate: 'apt' };
    }

    // ── macOS ──────────────────────────────────────────────────
    if (platform === 'darwin') {
        return { type: 'macos', display: 'macOS', pm: 'brew', pmAlternate: 'port' };
    }

    if (platform === 'linux') {
        // ── WSL (Windows Subsystem for Linux) ─────────────────
        try {
            const procVer = fs.existsSync('/proc/version')
                ? fs.readFileSync('/proc/version', 'utf8').toLowerCase() : '';
            const isWSL = procVer.includes('microsoft') || procVer.includes('wsl') ||
                          release.toLowerCase().includes('microsoft') ||
                          process.env.WSL_DISTRO_NAME || process.env.WSLENV;
            if (isWSL) {
                return { type: 'wsl', display: 'Windows WSL', pm: 'apt', pmAlternate: 'apt-get' };
            }
        } catch {}

        // ── Cloud / Docker / Railway / Render / JustRunMy.App ───────────────────
        const isDocker = fs.existsSync('/.dockerenv') ||
            (fs.existsSync('/proc/1/cgroup') &&
             fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'));
        const isCloud  = process.env.RAILWAY_ENVIRONMENT || process.env.RENDER ||
                         process.env.HEROKU_APP_NAME || process.env.FLY_APP_NAME ||
                         process.env.REPL_ID || process.env.JUSTRUNMY_APP ||
                         process.env.PANEL_URL || isDocker;

        // ── JustRunMy.App / managed panel detection ────────────────────────────
        const isJustRunMy = (() => {
            try {
                const hostname = require('os').hostname();
                const cgroup = fs.existsSync('/proc/1/cgroup')
                    ? fs.readFileSync('/proc/1/cgroup', 'utf8') : '';
                return (
                    process.env.JUSTRUNMY_APP ||
                    hostname.includes('panel') ||
                    hostname.includes('justrun') ||
                    cgroup.includes('lxc') ||
                    cgroup.includes('containerd') ||
                    (isDocker && !process.env.RAILWAY_ENVIRONMENT && !process.env.RENDER)
                );
            } catch { return false; }
        })();

        // ── /etc/os-release to detect Linux distro ──────────────
        let distroId = '';
        let distroLike = '';
        try {
            if (fs.existsSync('/etc/os-release')) {
                const osr = fs.readFileSync('/etc/os-release', 'utf8');
                distroId   = (osr.match(/^ID=(.+)$/m)?.[1] || '').replace(/"/g,'').toLowerCase();
                distroLike = (osr.match(/^ID_LIKE=(.+)$/m)?.[1] || '').replace(/"/g,'').toLowerCase();
            }
        } catch {}

        // Arch Linux
        if (distroId === 'arch' || distroLike.includes('arch') ||
            fs.existsSync('/etc/arch-release')) {
            return { type: 'arch', display: 'Arch Linux', pm: 'pacman', pmAlternate: 'yay' };
        }

        // Alpine Linux
        if (distroId === 'alpine' || fs.existsSync('/etc/alpine-release')) {
            return { type: 'alpine', display: 'Alpine Linux', pm: 'apk', pmAlternate: 'apk' };
        }

        // Fedora
        if (distroId === 'fedora' || distroLike.includes('fedora')) {
            return { type: 'fedora', display: 'Fedora', pm: 'dnf', pmAlternate: 'dnf' };
        }

        // CentOS / RHEL / Rocky / AlmaLinux
        if (['centos','rhel','rocky','almalinux','ol'].includes(distroId) ||
            distroLike.includes('rhel') || distroLike.includes('centos') ||
            fs.existsSync('/etc/centos-release') || fs.existsSync('/etc/redhat-release')) {
            return { type: 'centos', display: 'CentOS/RHEL/Rocky', pm: 'yum', pmAlternate: 'dnf' };
        }

        // openSUSE
        if (distroId.includes('suse') || distroLike.includes('suse') ||
            fs.existsSync('/etc/SuSE-release')) {
            return { type: 'opensuse', display: 'openSUSE', pm: 'zypper', pmAlternate: 'zypper' };
        }

        // Void Linux
        if (distroId === 'void' || fs.existsSync('/etc/void-release')) {
            return { type: 'void', display: 'Void Linux', pm: 'xbps-install', pmAlternate: 'xbps-install' };
        }

        // Debian / Ubuntu / Mint / Kali / Raspberry Pi OS
        if (distroId === 'debian' || distroId === 'ubuntu' || distroId === 'kali' ||
            distroLike.includes('debian') || distroLike.includes('ubuntu') ||
            fs.existsSync('/etc/debian_version') || fs.existsSync('/etc/lsb-release')) {
            const label = isJustRunMy ? 'JustRunMy.App/Panel (Debian/Ubuntu)' :
                          isDocker ? 'Docker (Debian/Ubuntu)' :
                          isCloud ? 'Cloud VPS (Debian/Ubuntu)' : 'Ubuntu/Debian/VPS';
            return { type: isJustRunMy ? 'justrunmy' : 'ubuntu', display: label, pm: 'apt', pmAlternate: 'apt-get' };
        }

        // Generic Linux fallback
        return { type: 'linux', display: 'Linux (Generic)', pm: 'apt', pmAlternate: 'apt-get' };
    }

    // Windows (native node, not WSL)
    if (platform === 'win32') {
        return { type: 'windows', display: 'Windows', pm: 'winget', pmAlternate: 'choco' };
    }

    return { type: 'linux', display: 'Linux (Unknown)', pm: 'apt', pmAlternate: 'apt-get' };
}

// Check if package is installed
function checkPackageInstalled(packageName) {
    try {
        require.resolve(packageName);
        return true;
    } catch (e) {
        return false;
    }
}

// Check if npm is installed
function checkNpmInstalled() {
    try {
        execSync('npm --version', { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

// Check if command exists
function commandExists(cmd) {
    try {
        execSync(`which ${cmd}`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// 🔧 NODEJS AND PYTHON AUTO INSTALL/UPGRADE
// ═══════════════════════════════════════════════════════════

async function autoInstallNodeJS(osInfo) {
    const methods = {
        justrunmy: [
            'DEBIAN_FRONTEND=noninteractive apt-get update -y && apt-get install -y nodejs npm',
            'apt-get update -y && apt-get install -y nodejs npm',
            'apt update -y && apt install -y nodejs npm',
            'curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs',
        ],
        termux: [
            'pkg update -y && pkg install -y nodejs',
            'apt update -y && apt install -y nodejs',
            'pkg install -y nodejs npm',
            'apt install -y nodejs npm',
        ],
        ubuntu: [
            'sudo apt update && sudo apt install -y nodejs npm',
            'sudo apt-get update && sudo apt-get install -y nodejs npm',
            'sudo snap install node --classic',
            'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs',
        ],
        wsl: [
            'sudo apt update && sudo apt install -y nodejs npm',
            'sudo apt-get update && sudo apt-get install -y nodejs npm',
            'winget install OpenJS.NodeJS',
        ],
        macos: [
            'brew update && brew install node',
            'brew upgrade node',
            'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash',
        ],
        linux: [
            'sudo apt update && sudo apt install -y nodejs npm',
            'sudo yum install -y nodejs npm',
            'sudo dnf install -y nodejs npm',
            'sudo pacman -S --noconfirm nodejs npm',
        ]
    };

    const cmdList = methods[osInfo.type] || methods.linux;
    
    for (let i = 0; i < cmdList.length; i++) {
        try {
            log.info(`[${i + 1}/${cmdList.length}] Attempting Node.js install: ${cmdList[i].substring(0, 60)}...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 180000 });
            
            if (checkNpmInstalled()) {
                log.success('Node.js successfully installed!');
                return true;
            }
        } catch (e) {
            log.warn(`Attempt ${i + 1} failed...`);
        }
    }
    return false;
}

async function autoInstallPython(osInfo) {
    const methods = {
        justrunmy: [
            'DEBIAN_FRONTEND=noninteractive apt-get update -y && apt-get install -y python3 python3-pip',
            'apt-get update -y && apt-get install -y python3 python3-pip',
            'apt update -y && apt install -y python3 python3-pip',
            'apt-get install -y python3',
        ],
        termux: [
            'apt update -y && apt install -y python3',
            'apt install -y python3-pip',
        ],
        ubuntu: [
            'sudo apt update && sudo apt install -y python3',
            'sudo apt-get update && sudo apt-get install -y python3',
            'sudo apt install -y python3-pip',
            'sudo apt-get install -y python3-pip',
        ],
        wsl: [
            'sudo apt update && sudo apt install -y python3',
            'winget install Python.Python.3.11',
        ],
        macos: [
            'brew update && brew install python3',
            'brew upgrade python3',
        ],
        linux: [
            'sudo apt update && sudo apt install -y python3',
            'sudo yum install -y python3',
            'sudo dnf install -y python3',
            'sudo pacman -S --noconfirm python',
        ]
    };

    const cmdList = methods[osInfo.type] || methods.linux;
    
    for (let i = 0; i < cmdList.length; i++) {
        try {
            log.info(`[${i + 1}/${cmdList.length}] Attempting Python3 install: ${cmdList[i].substring(0, 60)}...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 180000 });
            
            if (commandExists('python3')) {
                log.success('Python3 successfully installed!');
                return true;
            }
        } catch (e) {
            log.warn(`Attempt ${i + 1} failed...`);
        }
    }
    return false;
}

async function autoUpgradeSystemPackages(osInfo) {
    log.header('📦 Upgrading system packages');
    
    const upgradeMethods = {
        justrunmy: [
            'DEBIAN_FRONTEND=noninteractive apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y',
            'apt-get update -y && apt-get upgrade -y',
            'apt update -y && apt upgrade -y',
        ],
        termux: [
            'pkg update -y && pkg upgrade -y',
            'apt update -y && apt upgrade -y',
            'apt update && apt full-upgrade -y',
        ],
        ubuntu: [
            'sudo apt update && sudo apt upgrade -y',
            'sudo apt-get update && sudo apt-get upgrade -y',
            'sudo apt update && sudo apt full-upgrade -y',
        ],
        wsl: [
            'sudo apt update && sudo apt upgrade -y',
            'sudo apt-get update && sudo apt-get upgrade -y',
        ],
        macos: [
            'brew update && brew upgrade',
            'softwareupdate -i -a',
        ],
        linux: [
            'sudo apt update && sudo apt upgrade -y',
            'sudo yum update -y',
            'sudo dnf upgrade -y',
            'sudo pacman -Syu --noconfirm',
        ]
    };

    const cmdList = upgradeMethods[osInfo.type] || upgradeMethods.linux;
    
    for (let i = 0; i < cmdList.length; i++) {
        try {
            log.info(`[${i + 1}/${cmdList.length}] System upgrade attempt...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 300000 });
            log.success('System packages upgrade successful!');
            return true;
        } catch (e) {
            log.warn(`Attempt ${i + 1} failed...`);
        }
    }
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🎵 Package installation with 10 attempts (with fallbacks)
// ═══════════════════════════════════════════════════════════

async function installPackageWithFallback(osInfo, packageName, maxAttempts = 10) {
    const installMethods = {
        justrunmy: [
            () => `DEBIAN_FRONTEND=noninteractive apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${packageName}`,
            () => `apt-get update -y && apt-get install -y ${packageName}`,
            () => `apt update -y && apt install -y ${packageName}`,
            () => `DEBIAN_FRONTEND=noninteractive apt-get install -y ${packageName}`,
            () => `pip3 install --break-system-packages ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `python3 -m pip install --break-system-packages ${packageName}`,
            () => `python3 -m pip install ${packageName}`,
            () => `apt-get install -y --fix-broken && apt-get install -y ${packageName}`,
            () => `apt-get upgrade -y && apt-get install -y ${packageName}`,
        ],
        termux: [
            () => `pkg update -y && pkg install -y ${packageName}`,
            () => `apt update -y && apt install -y ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `pip install ${packageName}`,
            () => `apt install -y ${packageName}`,
            () => `pkg install -y ${packageName}`,
            () => `apt upgrade -y && apt install -y ${packageName}`,
            () => `pkg upgrade -y && pkg install -y ${packageName}`,
            () => `apt full-upgrade -y && apt install -y ${packageName}`,
            () => `pip3 install --upgrade ${packageName}`,
        ],
        ubuntu: [
            () => `sudo apt update && sudo apt install -y ${packageName}`,
            () => `sudo apt-get update && sudo apt-get install -y ${packageName}`,
            () => `sudo apt upgrade -y && sudo apt install -y ${packageName}`,
            () => `sudo apt-get upgrade -y && sudo apt-get install -y ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `sudo pip3 install ${packageName}`,
            () => `pip install ${packageName}`,
            () => `sudo snap install ${packageName}`,
            () => `sudo apt full-upgrade -y && sudo apt install -y ${packageName}`,
            () => `pip3 install --upgrade ${packageName}`,
        ],
        wsl: [
            () => `sudo apt update && sudo apt install -y ${packageName}`,
            () => `sudo apt-get update && sudo apt-get install -y ${packageName}`,
            () => `sudo apt upgrade -y && sudo apt install -y ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `sudo pip3 install ${packageName}`,
            () => `winget install -e --id ${packageName}`,
            () => `sudo apt full-upgrade -y && sudo apt install -y ${packageName}`,
            () => `pip install ${packageName}`,
            () => `pip3 install --upgrade ${packageName}`,
            () => `sudo dpkg --configure -a && sudo apt install -y ${packageName}`,
        ],
        macos: [
            () => `brew update && brew install ${packageName}`,
            () => `brew upgrade && brew install ${packageName}`,
            () => `brew tap-new local/tools && brew install ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `pip install ${packageName}`,
            () => `sudo pip3 install ${packageName}`,
            () => `brew update && brew upgrade ${packageName}`,
            () => `pip3 install --upgrade ${packageName}`,
            () => `sudo port install ${packageName}`,
            () => `curl -L https://package.manager | install ${packageName}`,
        ],
        linux: [
            () => `sudo apt update && sudo apt install -y ${packageName}`,
            () => `sudo yum install -y ${packageName}`,
            () => `sudo dnf install -y ${packageName}`,
            () => `sudo pacman -S --noconfirm ${packageName}`,
            () => `pip3 install ${packageName}`,
            () => `sudo apt upgrade -y && sudo apt install -y ${packageName}`,
            () => `sudo yum upgrade -y && sudo yum install -y ${packageName}`,
            () => `sudo dnf upgrade -y && sudo dnf install -y ${packageName}`,
            () => `pip3 install --upgrade ${packageName}`,
            () => `sudo -E pip3 install ${packageName}`,
        ]
    };

    const methods = installMethods[osInfo.type] || installMethods.linux;
    const attemptLimit = Math.min(maxAttempts, methods.length);

    for (let attempt = 1; attempt <= attemptLimit; attempt++) {
        try {
            const cmd = methods[attempt - 1]();
            log.info(`[${attempt}/${attemptLimit}] Installing ${packageName}: ${cmd.substring(0, 70)}...`);
            execSync(cmd, { stdio: 'inherit', timeout: 180000 });
            log.success(`${packageName} successfully installed!`);
            return true;
        } catch (e) {
            log.warn(`Attempt ${attempt}/${attemptLimit} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    log.error(`All installation attempts for ${packageName} failed!`);
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🎯 Critical packages auto install/upgrade
// ═══════════════════════════════════════════════════════════

async function installCriticalPackages(osInfo, packages) {
    log.header('🔧 Installing critical packages (10 attempts each)');
    
    let allSuccess = true;
    
    for (const pkg of packages) {
        const success = await installPackageWithFallback(osInfo, pkg, 10);
        if (!success) {
            allSuccess = false;
            log.error(`${pkg} installation failed - functions may be limited!`);
        }
    }

    return allSuccess;
}

// 🎵 Commands for installing music tools
function getMusicToolsInstallCommands(osInfo, packages) {
    const cmds = {
        termux: {
            methods: [
                { cmd: `apt update -y && apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `pkg update -y && pkg install -y ${packages.join(' ')}`, desc: 'pkg update + install' },
                { cmd: `apt upgrade -y && apt install -y ${packages.join(' ')}`, desc: 'apt upgrade + install' }
            ],
            update: `apt update -y`,
            install: `apt install -y ${packages.join(' ')}`
        },
        ubuntu: {
            methods: [
                { cmd: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt upgrade + install' },
                { cmd ${packages.join(' ')}`, desc: 'apt upgrade + install' },
                { cmd: `sudo apt-get update -y && sudo apt-get install -y ${packages.join(' ')}`, desc: 'apt-get update + install' }
            ],
           : `sudo apt-get update -y && sudo apt-get install -y ${packages.join(' ')}`, desc: 'apt-get update + install' }
            ],
            update: `sudo update: `sudo apt update -y apt update -y`,
           `,
            install: install: `sudo apt install `sudo apt install -y -y ${packages.join ${packages.join(' ')}`
(' ')}`
        },
        },
        wsl:        wsl: {
            {
            methods: methods: [
                { cmd [
                { cmd: `: `sudo apt update -y &&sudo apt update -y && sudo apt install -y ${ sudo apt install -y ${packagespackages.join(' ')}`, desc: '.join(' ')}`, desc: 'apt updateapt update + install' },
 + install' },
                {                { cmd: `sudo cmd: `sudo apt upgrade -y apt upgrade -y && sudo apt install && sudo apt install -y -y ${packages.join ${packages.join(' '(' ')}`, desc: 'apt)}`, desc: 'apt upgrade + install' upgrade + install' }
            }
            ],
            update: ],
            update: `sudo apt update -y `sudo apt update -y`,
           `,
            install: install: `sudo apt install `sudo apt install -y ${packages.join(' ')}`
        },
        mac -y ${packages.join(' ')}`
        },
        macosos: {
           : {
            methods: methods: [
                { cmd [
                { cmd: `brew update && brew: `brew update && brew install ${ install ${packages.join('packages.join(' ')} ')}`, desc: 'brew update`, desc: 'brew update + install + install' },
' },
                { cmd: `brew upgrade && brew install ${pack                { cmd: `brew upgrade && brew install ${packages.joinages.join(' '(' ')}`, desc: 'brew upgrade + install' },
               )}`, desc: 'brew upgrade + { cmd: ` install' },
                { cmdpip3: `pip3 install ${packages.join(' install ${packages ')}.join(' ')}`, desc`, desc: ': 'pip3pip3 install' install' }
            ],
            }
            ],
            update: `brew update`,
            install update: `brew update`,
            install: `brew install ${pack: `brew install ${packages.joinages.join(' ')}`
(' ')}`
        },
        linux: {
            methods        },
        linux: {
            methods: [
               : [
                { { cmd: `sudo apt update -y && sudo apt install -y ${pack cmd: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`,ages.join(' ')}`, desc: 'apt update + desc: 'apt install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt upgrade ')}`, desc: 'apt upgrade + install + install' },
' },
                { cmd:                { cmd: `sudo `sudo yum yum install -y ${ install -y ${packages.joinpackages.join('(' ')} ')}`, desc`, desc: ': 'yum install'yum install' },
                { cmd: ` },
                { cmd: `sudo dsudo dnf install -ynf install -y ${pack ${packages.joinages.join(' ')}`, desc: 'dnf install' }
(' ')}`, desc: 'dnf install' }
            ],
            update: `sudo apt update -y`,
            install: `sudo apt            ],
            update: `sudo apt update -y`,
            install: `sudo apt install -y ${packages.join(' ')}`
        install -y ${packages.join(' ')}`
        }
    };
    
    return }
    };
    
    return cmds[os cmdsInfo.type] || cmds[osInfo.type] || cmds.l.linux;
}

//inux;
}

 🎵 Commands// 🎵 for installing YouTube packages
async function install Commands for installing YouTube packages
asyncYouTubePack function installYouTubePackages(osages(osInfo)Info) {
    {
    log.header log.header('📥 Installing('📥 Installing YouTube Download YouTube Download Packages');
    
    Packages');
    
    const all const allPackagesPackages = [];
    Object.values(YOUTUB = [];
    Object.values(YOUTUBE_ME_METHODS).forEachETHODS).forEach(method(method => {
        all => {
Packages        allPackages.push(...method.packages);
.push(...method.packages);
    });
    });
    
    const unique    
    const uniquePackages = [...new Set(allPackages)];
Packages = [...new Set(allPack    logages)];
    log.info(`📦.info(` All YouTube📦 All YouTube packages: ${uniquePackages.join(', ')}\ packages: ${uniquePackages.join(',n`);
    
    const install ')}\n`);
    
   Cmds = getInstall const installCmds = getCommands(osInfoInstallCommands(osInfo, uniquePackages);
    
, uniquePackages);
    
    let    let attempts = 0;
    const maxAttempts attempts = 0;
    const maxAttempts = 3;
 = 3;
    let    let installSuccess = false;
    
 installSuccess = false;
    
    while    while (!installSuccess && (!installSuccess && attempts < maxAttempt attempts < maxAttempts)s) {
        attempts++;
        try {
            {
        attempts++;
        try {
            log.header(`📥 YouTube Packages Install Attempt ${attempts log.header(`📥 YouTube Packages Install}/${max Attempt ${attempts}/${maxAttemptsAttempts}`);
            
}`);
            
            if (os            ifInfo.type (os !== 'macos') {
Info.type !== 'macos') {
                try {
                    log.info                try {
                    log.info('Up('Updating repository...');
dating repository...');
                    exec                    execSync(installCmSync(installCmds.updateds.update, { stdio, { stdio: ': 'inherit',inherit', timeout: 600 timeout: 60000 });
                }00 });
 catch (                } catch (e)e) {
                    log.warn(' {
                    log.warn('Update failed, attempting installation anyway...');
               Update failed, attempting installation anyway...');
                }
            }
            
            log.info }
            }
            
           (`Installing ${unique log.info(`InstallingPackages ${uniquePackages.join(', ')}...\.join(', ')}...\n`);
n`);
            exec            execSync(Sync(installCminstallCmds.install,ds.install, { std { stdio:io: 'inherit 'inherit', timeout', timeout: 180000: 180000 });
            
 });
            
            installSuccess =            installSuccess = true;
            log.success(' true;
            log.success('✅ YouTube Packages successfully✅ YouTube Packages successfully installed!');
        } catch installed!');
        } catch (e (e) {
) {
            log.warn            log.warn(`Attempt ${attempt(`Attempt ${attempts} failed`);
            
            if (attempts < maxs} failed`);
            
            if (attempts < maxAttempts) {
                log.info(`${Attempts) {
                log.info(`${maxAttempts -maxAttempts - attempts} attempts} attempts remaining... ret attempts remaining... retrying...rying...`);
                await new Promise(res`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
olve => setTimeout(resolve, 2000));
            }
        }
    }
    
       
    if (!installSuccess) {
        log.warn('YouTube if (!installSuccess) {
        log.warn('YouTube packages manual packages manual installation may be installation may be required: required:');
        console');
        console.log(` .log(`  ${chalk.y ${chalk.yellow(installCmds.ellow(installCmds.install)}\n`);
    }
    
   install)}\n`);
    }
    
    return installSuccess;
}

// return installSuccess;
}

// Try Try multiple methods to install ffm multiple methods to installpeg
async function ffmpeg
async function install installFFmpeg(osInfoFFmpeg(osInfo) {
    log.header(`) {
    log.header(`📥 ffm📥peg mandatory - trying all ffmpeg mandatory - trying platform methods`);

    const has all platform methods`);

   Root = const hasRoot = process.getuid ? process.getuid ? process.get process.getuid() === 0 : true;
    ifuid() === 0 : true;
    if (!hasRoot) (!hasRoot) {
        {
        log.info log.info('('🔐 Attempting root access...🔐 Attempting root access...');
        try {
            exec');
        try {
            execSync('Sync('sudo -v -p "" sudo -v -p ""2 2>/dev>/dev/null || true', { stdio: 'pipe', timeout: 5000 });
       /null || true', { stdio: 'pipe', timeout: 5000 });
        } catch (e } catch (e) {}
    }

    // Platform-specific repository fix) {}
    }

    // Platform-specific repository fix commands
    const commands
    const repoFix repoFixCommands = {
        termux: [
Commands = {
        termux: [
            'sed -i "            'sed -i "s/^deb http/des/^deb http/deb [trusted=yesb [trusted=yes] http] http/" /etc/apt/sources.list/" /etc/apt/sources.list 2 2>/dev/null || true',
            '>/dev/null || true',
            'apt-key adv --keyserver keyserverapt-key adv --keyserver keyserver.ubuntu.ubuntu.com --recv-keys 2>/dev/null || true',
            'apt clean && apt.com --recv-keys 2>/dev/null || true',
            'apt clean update - && apt update -y 2>/y 2>/dev/null || true'
        ],
       dev/null || true'
        ],
        ubuntu: [
 ubuntu            ': [
            'sudo aptsudo apt-key adv-key adv --keys --keyserver keyserver.ubuntu.comerver keyserver.ubuntu.com --recv-keys 2>/ --recv-keys 2>/dev/nulldev/null || true',
            || true',
            'sudo add- 'sudo add-apt-reapt-repository ppa:ubuntu-toolchainpository ppa:ubuntu-toolchain-r/test-r/test -y 2 -y 2>/dev/null || true',
>/dev/null ||            'sudo sed -i "s/^ true',
            'sudo sed -i "s/^deb http/debdeb http/deb [trusted=yes] [trusted= http/"yes] http/" /etc/apt /etc/apt/sources.list 2>/dev/null/sources.list 2>/dev/null || true || true',
            'sudo',
            'sudo apt clean apt clean && sudo apt update && sudo apt update -y -y 2 2>/dev/null ||>/dev true',
/null || true',
            'sudo dp            'sudo dpkg --configure -kg --configure -a a 2>/2>/dev/null || true'
        ],
       dev/null || true'
        ],
        wsl: [
            'sudo apt-key adv --keys wsl: [
            'sudo apt-key adv --keyserver keyserver.ubuntu.comerver keyserver.ubuntu.com --recv- --reckeys 2>/v-keys 2>/dev/nulldev/null || true',
            || true',
            'sudo 'sudo sed - sed -i "i "s/^deb http/debs/^deb http/deb [trusted [trusted=yes=yes] http] http/" /etc//" /etc/apt/sapt/sources.list 2>/dev/null ||ources.list 2>/dev true',
/null || true',
            'sudo apt            'sudo apt clean && sudo apt clean && sudo apt update -y 2>/dev/null || true',
            'sudo dpkg update -y 2>/dev/null || true',
            'sudo dpkg --configure -a 2 --configure -a 2>/dev>/dev/null || true'
/null || true'
        ],
        macos: [
                   ],
        macos: [
            'sudo chown 'sudo chown -R -R $(whoami) /usr/local/bin $(whoami) /usr/local/bin 2 2>/dev/null ||>/dev/null || true',
            'sudo mk true',
            'sudo mkdir -p /dir -p /usr/localusr/local/bin 2>//bin 2>/dev/null || true'
       dev/null || true'
        ],
        linux: ],
        linux: [
            'sudo [
            'sudo apt-key adv -- apt-keykeyserver adv --keyserver keyserver keyserver.ubuntu.com --.ubuntu.com --recv-keysrecv-keys 2 2>/dev>/dev/null || true',
/null || true',
            '            'sudo sed -i "s/^sudo sed -i "sdeb http/^deb http/deb/deb [trusted= [trusted=yes]yes] http/" http/" /etc/apt/sources /etc/apt/sources.list 2>/.list dev/null2>/dev/null || true || true',
            'sudo',
            'sudo apt clean apt clean && sudo apt update && sudo apt update -y -y 2>/dev 2>/dev/null ||/null || true',
 true',
            'sudo dp            'sudo dpkg --configure -kg --configure -a 2>/dev/nulla 2>/dev/null || true || true',
            'sudo yum clean all',
            'sudo yum clean all 2 2>/dev/null || true',
            'sudo pacman -Sc --noconfirm 2>/dev>/dev/null || true',
            'sudo pacman -Sc --noconfirm 2>/dev/null || true'
        ]
    };

    const repoF/null || true'
        ]
    };

    const repoFixes = repoFixCommandsixes = repoFixCommands[osInfo.type][osInfo.type] || [];
    log || [];
    log.info('\n.info('\n🔧 Applying repository fixes🔧 Applying...');
 repository fixes...');
    for (const cmd of    for (const cmd of repoF repoFixes)ixes) {
        try {
            exec {
        try {
            execSync(cmd,Sync(cmd, { std { stdio:io: 'pipe', shell 'pipe', shell: '/: '/bin/bash', timeout: bin/bash', timeout: 30000 });
            log.info30000 });
           (`✓ log.info ${cmd.substring((`✓ ${cmd.substring(0, 60)}`);
0, 60)}`);
        }        } catch ( catch (e) {}
   e) {}
    }

    }

    const termuxMethods const term = getuxMethods = getInstallCommands({typeInstallCommands({type: ': 'termuxtermux', display: '', display: 'TermuxTermux'}, ['ffmpeg'}, ['ffmpeg']).methods;
    const']).methods;
    const ubuntu ubuntuMethods = getInstallCommands({type: 'ubuntuMethods = getInstallCommands({type: 'ubuntu', display: 'Ubuntu', display: 'Ubuntu'}, ['ffmpeg'}, ['ffmpeg']).methods;
    const wsl']).methods;
    constMethods = get wslMethods =InstallCommands({type: getInstallCommands({ 'wsl',type: 'wsl', display: 'WSL'}, [' display: 'WSL'}, ['ffmpeg']).methods;
   ffmpeg']).methods;
    const macosMethods const macosMethods = getInstallCommands({type = getInstallCommands({type: 'macos', display: 'macos', display: 'macOS'}, ['ff: 'macOS'}, ['ffmpegmpeg']).']).methods;
    constmethods;
    const linuxMethods = getInstallCommands({type: ' linuxMethods = getInstallCommands({type: 'linux',linux', display: 'Linux'}, display: 'Linux'}, ['ff ['ffmpegmpeg']).methods;

    const allPlatform']).methods;

    const allPlatforms = [
       s = [
        { name { name: 'Termux', methods: termuxMethods },
       : 'Termux', methods: termuxMethods },
        { name: ' { name: 'UbuntuUbuntu/Debian/Debian', methods:', methods: ubuntuMethods },
        { name: 'WSL/ ubuntuMethods },
        { name: 'WSL/Windows',Windows', methods: methods: wslMethods },
 wslMethods },
        {        { name: name: 'mac 'macOS',OS', methods: methods: macosMethods },
        { name: macosMethods },
        { name: 'Linux 'Linux (Generic)', methods (Generic)', methods: linux: linuxMethods }
    ];

Methods }
    ];

    let    let totalAttempts = totalAttempts = 0 0;

   ;

    for (const platform of all for (const platform of allPlatforms) {
Platforms) {
        log        log.info(`\n.info(`\n${ch${chalk.bold.cyan(`alk.bold.cyan(`━━━ ${platform━━━ ${platform.name}.name} ━ ━━━`)}`);
        for (const━━`)}`);
        for (const method of method of platform.methods) platform.methods) {
            {
            totalAttempts++;
            try totalAttempts++;
            try {
                log.info {
                log.info(`[${total(`[${totalAttempts}] ${chalk.yellowAttempts}] ${chalk.yellow(method(method.desc.substring(0,.desc.substring(0, 50))}`);
 50))}`);
                
                               
                let cmd = method.cmd;
                if (!hasRoot && !cmd.includes('sudo let cmd = method.cmd;
                if (!hasRoot && !cmd.includes('sudo') &&') && !cmd.includes('brew') && os !cmd.includes('brew')Info.type && osInfo.type !== 'termux') {
 !== 'termux') {
                    cmd                    cmd = ` = `sudo -sudo -E bash -c "${cmd.replace(/"/gE bash -c "${cmd.replace(/"/g, ', '\\"')}"`;
                }
                
\\"')}"`;
                }
                
                exec                execSync(cmd, { stdio:Sync(cmd, { stdio: 'inherit 'inherit', timeout', timeout: : 120000, shell: '/bin/bash120000, shell: '/bin/bash' });
' });
                await new Promise(r => setTimeout(r                await new Promise(r => setTimeout(r, 500));
                
                try {
, 500));
                
                try {
                    const                    const v = v = execSync execSync('ff('ffmpeg -versionmpeg 2>&1 | head -version 2>&1 | head -n1', { encoding: 'utf8 -n1', { encoding: 'utf8', timeout: 5000 });
                   ', timeout: 5000 if ( });
                    if (v.includesv.includes('ffmpeg('ffmpeg')) {
                        log.success(`\n✅ ffmpeg OK! (attempt ${totalAttempts})\n`);
                        return true;
                   ')) {
                        log.success(`\n✅ ffmpeg OK! (attempt ${totalAttempts})\n`);
                        return true;
                    }
                } catch (e) {}
                
                if (commandExists('ff }
                } catch (e) {}
                
                if (commandExists('ffmpeg')) {
mpeg')) {
                    log.success(`                    log.success(`\n✅ ff\n✅ ffmpeg installed! (attemptmpeg installed! (attempt ${total ${totalAttempts})\nAttempts})\n`);
                   `);
                    return true;
                return true;
                }
            } catch }
            } catch (e (e) {
) {
                log                log.warn.warn('✗ failed('✗ failed');
            }
        }
   ');
            }
        }
    }

    log.error }

    log.error(`\(`\n❌ ffmpeg install failedn❌ ffmpeg!`);
    return install failed!`);
    return false;
 false;
}

// Complete installation}

// Complete installation commands for commands for all platforms
function all platforms
function getInstall getInstallCommands(osInfo, packages)Commands(osInfo, packages) {
    {
    const p const pkg =kg = packages[0];
    
    const cmds = {
        packages[0];
    
    const cmds = justrun {
        justrunmy:my: {
            {
            methods: [
                methods: [
                { cmd: `DEBI { cmd: `DEBIAN_FAN_FRONTEND=noninteractive aptRONTEND=noninter-get update -yactive apt-get update -y && DE && DEBIAN_FRBIAN_FRONTEND=noninteractiveONTEND=noninteractive apt-get apt-get install -y --no-install-re install -y --no-install-recommendscommends ${pack ${packages.join(' 'ages.join(' ')}`, desc:)}`, 'apt-get DE desc: 'apt-get DEBIAN_FRONTEND (noBIAN_FRONTEND (no sudo)' sudo)' },
                { cmd: ` },
                { cmd: `apt-get update -y &&apt-get update -y && apt-get install -y ${ apt-get install -y ${packages.join(' ')}packages.join(' ')}`, desc: 'apt-get (no`, desc: 'apt-get (no sudo)' sudo)' },
                { cmd: ` },
                { cmd: `apt update -y && aptapt update -y && apt install - install -y --no-install-rey --no-install-recommends ${packages.join(' ')}`,commends ${packages.join(' ')}`, desc: 'apt desc: 'apt --no-install --no-install-recommends' },
               -recommends' },
                { cmd: `apt update -y { cmd: `apt update -y && apt install -y ${packages.join(' ')}`, desc: 'apt ( && apt install -y ${packages.join(' ')}`, desc: 'apt (no sudo)' },
                {no sudo)' },
                { cmd: `DEBIAN cmd: `DEBIAN_FR_FRONTEND=noninteractive apt-get install -y ${packagesONTEND=noninteractive apt-get install -y ${packages.join(' ')}`, desc: 'apt-get.join(' ')}`, desc: 'apt-get direct' direct' },
                { cmd },
                { cmd: `apt-get install -y --: `apt-get install -y --fix-broken && apt-get installfix-broken && apt-get install -y -y ${pack ${packages.join(' ')}`, desc: 'apt-get fixages.join(' ')}`, desc: 'apt-get fix-bro-broken +ken + install' install' },
                { cmd: ` },
                { cmd: `pip3pip3 install --break-system install --break-system-packages ${p-packageskg}`, desc: 'pip3 ${pkg}`, desc: 'pip3 --break --break-system-packages'-system-packages' },
                },
                { cmd: `pip3 install ${pkg { cmd: `pip3 install ${pkg}`, desc:}`, desc: 'pip3' },
                'pip3' },
                { cmd: `python3 { cmd: `python3 -m pip install --break-system-packages ${pkg -m pip install --break-system-packages ${pkg}`, desc:}`, desc: 'python3 -m pip --break 'python3 -m pip --break-system-packages'-system-packages' },
            },
            ],
            update: `DE ],
            update: `DEBIAN_FRBIANONTEND=noninteractive_FRONTEND=non apt-getinteractive apt-get update -y`,
 update -            install: `y`,
            install: `DEBIAN_FRONTDEBIAN_FRONTEND=noninterEND=active aptnoninteractive apt-get install -y --no-get install -y --no-install-recomm-installends ${-recommends ${packagespackages.join(' ')}.join(' ')}`
       `
        },
        termux: {
            methods },
        termux: {
            methods: [
                { cmd: `pkg update: [
                { cmd: `pkg update -y && p -y && pkg installkg install -y ${packages.join(' ')}`, desc: -y ${packages.join(' ')}`, desc: 'pkg update 'pkg update + install + install' },
' },
                { cmd: `p                { cmd: `pkg upgrade -ykg upgrade -y && p && pkg install -y ${packkg install -y ${packages.join(' 'ages.join(' ')}`,)}`, desc: 'p desc: 'pkg upgrade + install' },
                {kg upgrade + install' },
                { cmd: cmd: `apt update -y && `apt update -y && apt install apt install -y ${pack -y ${packages.join(' ')}`,ages.join(' ')}`, desc: 'apt update + desc: 'apt install' },
                { cmd: ` update + install' },
                { cmd: `apt upgradeapt upgrade -y -y && apt && apt install - install -y ${packagesy ${.join('packages ')}`, desc.join(' ')}`, desc: ': 'apt upgrade + install' },
apt upgrade + install' },
                { cmd: `apt-get update                { cmd: -y && apt `apt-get update -y && apt-get install-get install -y ${packages.join(' ')}`, desc: 'apt-get update + install' },
 -y ${packages.join(' ')}`, desc: 'apt-get update + install' },
                { cmd:                { cmd: `apt-get upgrade -y `apt-get upgrade -y && apt-get install && apt -y ${pack-get install -yages.join ${packages.join(' '(' ')}`, desc:)}`, 'apt desc: 'apt-get upgrade-get upgrade + install' }
 + install' }
            ],
            update            ],
: `pkg update -            update: `pkgy`,
            install update -y`,
            install: `pkg: `pkg install -y ${packages install -y ${packages.join('.join(' ')}`
        ')}`
        },
        },
        ubuntu: {
            methods ubuntu: {
            methods: [
: [
                {                { cmd: `sudo cmd: `sudo apt update apt update -y -y && sudo && sudo apt install -y ${packages.join apt install -y ${pack(' ')}`, desc:ages.join(' ')}`, desc: 'apt update + install' },
                'apt update + install' { cmd: `sudo apt },
                { cmd: ` upgrade -y && sudo aptsudo apt upgrade -y && sudo apt install -y ${packages install -y ${packages.join(' ')}`, desc.join(' ')}`, desc: 'apt upgrade + install: 'apt upgrade + install' },
                { cmd: `sudo apt-get' },
                { cmd: `sudo apt-get update - update -y && sudo apty && sudo apt-get install -y ${packages.join-get install -y ${packages.join(' ')}`, desc: 'apt(' ')}`, desc: 'apt-get update-get update + install' },
 + install' },
                { cmd: `sudo                { cmd: `sudo apt-get upgrade apt-get upgrade -y && -y && sudo apt sudo apt-get install -y-get install -y ${pack ${packages.join(' ')}`,ages.join(' ')}`, desc: 'apt-get upgrade desc: 'apt-get upgrade + install' },
 + install                { cmd: `sudo' },
                { cmd: DEBIAN_FRONT `sudo DEBIAN_FEND=RONTEND=noninternoninteractive aptactive apt update && sudo apt install - update &&y ${ sudo apt install -y ${packages.join(' ')}packages.join(' ')}`, desc: '`, desc: 'apt with DEBIAN_FRONTapt with DEBIAN_FRONTEND' },
               END' { cmd },
                { cmd: `sudo snap: `sudo snap install ${ install ${pkgpkg}`, desc:}`, desc: 'snap install' },
 'snap install' },
                {                { cmd: cmd: `sudo apt aut `sudooremove apt autoremove -y && sudo apt clean -y -y && sudo apt clean -y && sudo apt update && sudo && sudo apt update && sudo apt install -y ${packages.join(' ' apt install -y ${packages.join(' ')}`,)}`, desc: 'apt desc: 'apt clean + clean + update + install' }
            update + install' }
            ],
            update: ],
            update: `sudo `sudo apt update -y`,
            install: `sudo apt update -y`,
            install: `sudo apt install apt install -y -y ${packages.join(' ' ${packages.join(' ')}`
        },
        wsl: {
           )}`
        },
        wsl: {
            methods: methods: [
                { cmd: ` [
                { cmd: `sudo apt update -y &&sudo apt update -y && sudo apt install -y ${ sudo apt install -y ${packages.join(' ')}packages.join(' ')}`, desc`, desc: ': 'apt updateapt update + install + install' },
' },
                {                { cmd: cmd: `sudo apt upgrade -y && sudo apt install -y `sudo apt upgrade -y && sudo apt install -y ${pack ${packages.joinages.join(' '(' ')}`, desc: 'apt upgrade + install)}`, desc: 'apt upgrade + install' },
               ' },
                { cmd { cmd: `: `sudo apt-get updatesudo apt -y-get update -y && sudo && sudo apt-get install - apt-get install -y ${packages.join('y ${packages ')}`, desc.join(' ')}`, desc: ': 'apt-getapt-get update + install' },
                update + install' },
                { cmd: ` { cmdsudo apt-get upgrade -y: `sudo apt-get upgrade -y && sudo apt-get && sudo apt-get install - install -y ${packages.join('y ${packages.join(' ')}`, desc: ')}`, desc: 'apt-get upgrade + install' 'apt-get upgrade + install' },
                { cmd: `sudo DEBIAN_FRONTEND },
                { cmd: `sudo DEBIAN_FRONTEND=non=noninteractive apt update && sudo apt installinteractive apt update && sudo apt install -y -y ${pack ${packages.joinages.join(' ')}`, desc:(' ')}`, 'apt desc: 'apt with DE with DEBIANBIAN_FRONTEND_FRONTEND' },
' },
                {                { cmd: `sudo cmd: apt autoremove `sudo apt autoremove -y && sudo -y && sudo apt clean -y apt clean && sudo apt update && sudo apt install -y && sudo apt update && sudo apt install -y -y ${pack ${packages.join(' ')}`,ages.join(' ')}`, desc: 'apt clean + desc: 'apt clean + install' install' },
                },
                { cmd { cmd: `winget install: `winget -e --id Gyan.FFm install -e --id Gyan.FFmpeg -h --accept-source-agreements`, descpeg -h --accept-source-agreements: '`, descwinget install': 'winget install' },
                { cmd },
               : `choco { cmd: `choco install ff install ffmpeg -ympeg -y`, desc`, desc: ': 'chocolatechocolateyy install' }
 install' }
            ],
            ],
            update: `sudo apt            update: `sudo apt update -y`,
            install update -y`,
: `            install: `sudo aptsudo apt install - install -y ${packagesy ${.join(' ')}`
        },
       packages.join(' ')}`
        },
        macos: {
 macos: {
            methods            methods: [
                {: [
                { cmd: cmd: `brew `brew update && update && brew install brew install ${packages.join ${pack(' ')}`,ages.join(' ' desc:)}`, desc: 'brew update + 'brew update + install' install' },
                { cmd: `brew upgrade && brew },
                { cmd: `brew upgrade && brew install ${packages install ${packages.join(' ')}.join('`, desc: 'brew upgrade ')}`, desc: ' + install' },
brew upgrade + install' },
                {                { cmd: cmd: `brew `brew update && brew upgrade update && brew upgrade && brew install ${packages && brew.join(' install ${packages.join(' ')}`, desc ')}`, desc: ': 'brew updatebrew update + upgrade + install + upgrade + install' },
' },
                {                { cmd: cmd: `sudo port self `sudo port selfupdate && sudo port install ${pkg}`, desc: 'macupdate && sudo port install ${pkg}`, desc: 'macports selfupdate + install' },
               ports selfupdate + install' { cmd: ` },
                { cmd: `sudo port upgrade outdated && sudo port installsudo port upgrade outdated && sudo port install ${p ${pkg}`, desckg}: '`, desc: 'macports upgrade outdatedmacports upgrade outdated + install + install' },
                {' },
 cmd: `brew tap home                { cmd:brew-ffmpeg/ `brew tap homebrew-ffmffmpeg && brew installpeg/ffmpeg && --with-options-here homebrew brew install --with-options-here homebrew-ff-ffmpegmpeg/ff/ffmpegmpeg/ffmpeg --HEAD 2/ffmpeg --HEAD>/dev 2>/dev/null ||/null || brew install brew install ffmpeg`, desc ffmpeg`,: 'brew desc: 'brew tap + tap + install' },
                install' },
                { cmd { cmd: `: `curl -curl -L https://L httpsever://evermeet.cxmeet.cx/ffmpeg/ffmpeg/getrelease/getrelease/zip/zip -o -o /tmp/ffmpeg.zip && unzip -o /tmp /tmp/ffmpeg.zip && unzip -o /tmp/ff/ffmpeg.zip -d /mpeg.zip -d /usr/local/bin/ && chusr/local/bin/mod + && chmod +x /x /usr/local/bin/usr/local/bin/ffmffmpeg`, desc: 'official evermepeg`, desc: 'official evermeet build' }
et build' }
            ],
            update: `brew update            ],
            update: `brew update`,
           `,
            install: `brew install ${ install: `brew install ${packages.join(' ')}`
        },
       packages.join(' ')}`
        },
        linux: linux: {
            methods: {
            [
                { cmd: `sudo apt methods: [
                { cmd update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${pack -yages.join ${packages.join(' '(' ')}`,)}`, desc: 'apt desc: 'apt upgrade + install' upgrade + install' },
                { cmd },
                { cmd: `sudo apt: `sudo apt-get update -y-get update -y && sudo && sudo apt-get install -y ${packages apt-get install -y ${packages.join('.join(' ')}`, desc: 'apt-get ')}`, desc: ' update +apt-get update + install' install' },
                },
                { cmd: ` { cmd: `sudo aptsudo apt-get upgrade-get upgrade -y && sudo apt-get -y && sudo apt-get install -y ${packages install -y ${packages.join('.join(' ')}`, desc: ' ')}`, desc: 'apt-get upgrade + install' },
                { cmdapt-get upgrade + install' },
                { cmd: `sudo DEBIAN_FRONTEND: `sudo DEBIAN_FRONTEND=noninteractive=noninteractive apt update && sudo apt update && sudo apt install -y ${packages.join(' ')}`, desc: 'apt with DEBIAN_FRONTEND apt install -y ${packages.join(' ')}`, desc: 'apt with DEBIAN_FRONTEND' },
' },
                { cmd:                { cmd: `sudo `sudo yum update -y && yum update -y && sudo yum install -y sudo yum install -y ${packages.join(' ')}`, ${packages.join(' ')}`, desc: 'y desc: 'yum updateum update + install' },
 + install' },
                {                { cmd: `sudo yum upgrade - cmd: `sudo yum upgrade -y && sudo yum instally && sudo yum install -y ${pack -y ${packages.join(' ')}ages.join`, desc: 'y(' ')}`, desc: 'yum upgradeum upgrade + install' },
 + install' },
                {                { cmd: cmd: `sudo `sudo dnf dnf update -y && sudo d update -y && sudo dnf installnf install -y ${pack -y ${packages.joinages.join(' ')}`, desc:(' ')}`, 'dn desc: 'dnf update + install' },
f update + install' },
                { cmd: `sudo                { cmd: `sudo dnf upgrade -y && sudo d dnf upgrade -y && sudo dnf installnf install -y -y ${packages.join ${packages.join(' '(' ')}`, desc:)}`, desc: 'dn 'dnf upgrade + installf upgrade' },
 + install                { cmd: `sudo' },
                { cmd: pacman `sudo pacman -Sy -Sy --noconf --noconfirm &&irm && sudo pacman - sudo pacman -S --noconfirm ${packS --noconfirm ${packages.join(' ')}`, desc:ages.join(' ')}`, desc: 'pac 'pacman sync + install' },
                {man sync + install' },
 cmd:                { `sudo pacman cmd: `sudo pacman -S -Syu --yu --noconfirmnoconfirm && sudo && sudo pacman -S pacman -S --n --noconfirm ${packagesoconfirm ${packages.join(' ')}`, desc.join(' ')}`, desc: 'pacman upgrade +: 'pacman upgrade + install' install' },
                },
                { cmd: `sudo z { cmd: `sudo zypperypper refresh && sudo z refresh &&ypper install - sudo zypper install -y ${y ${packagespackages.join(' ')}.join(' ')}`, desc`, desc: ': 'zypper refresh + install'zypper refresh + install' },
                { cmd: ` },
                { cmd: `sudo zypper update -sudo zypper update -y && sudo zyppery && sudo z install -ypper install -y ${packagesy ${packages.join('.join(' ')}`, desc: ' ')}`, desc: 'zypper update +zypper update + install' },
                { cmd: ` install' },
                { cmd: `sudo xbps-instsudo xbps-install -Sy && sudo xall -Sy && sudo xbps-install -bps-install -y ${packages.join('y ${packages.join(' ')} ')}`, desc`, desc: ': 'xbps sync +xbps sync + install' },
                { cmd install' },
                { cmd: `sudo xbps-install -: `sudo xbps-instSyu && sudoall -Syu && sudo xbps-install -y xbps-install ${pack -y ${packages.joinages.join(' '(' ')}`, desc: 'xbps upgrade)}`, desc: 'xbps upgrade + install + install'' },
                { cmd: },
                { cmd: `apk update && ap `apk update && apk add ${packk add ${packages.joinages.join(' ')}`,(' ')}`, desc: 'apk update + install desc: 'ap' },
k update + install' },
                { cmd:                { cmd: `ap `apk upgradek upgrade && apk add && apk add ${packages.join(' ' ${packages.join(' ')}`, desc:)}`, desc: 'apk upgrade + install 'apk upgrade' }
 + install' }
            ],
            update: `            ],
            update: `sudo apt update -sudo apty`,
            install: ` update -y`,
            installsudo apt: `sudo apt install -y ${packages.join(' install -y ${packages.join(' ')}`
        ')}`
        }
    };
    
    return cmds[osInfo.type] || cmds }
    };
    
    return cmds[osInfo.type] || cmds.linux;
}

.linux;
}

//// ═ ═══════════════════════════════════════════════════════════════════════════════════════════════════
//══════════════════
 🎵// 🎵 YT YT-DLP AUTO INST-DLPALL / AUTO INSTALL / UPDATE / UPGR UPDATE /ADE
// python UPGRADE
// python3 → pip33 → pip3 → binary fallback
 → binary fallback
//// ═════ ═══════════════════════════════════════════════════════════════════════════════════════════════════════════

async function install══════

asyncOrUpdateYt function installOrUpdateYtDlpDlp(osInfo(osInfo) {
) {
    log.header('📥 yt    log.header('📥-dlp yt-dlp install / install / update / update / upgrade');

    const alreadyInstalled = upgrade');

    const alreadyInst commandExistsalled = commandExists('yt-dlp('yt-dlp');
   ');
    if ( if (alreadyInstalled)alreadyInstalled) {
 {
               log.info('yt-dlp already installed — updating/upgrad log.info('yt-dlp already installed — updating/upgrading...');
    } else {
ing...');
    } else {
        log.info('yt-dlp not        log.info('yt-dlp not found — found — performing fresh install...');
    }

    const performing fresh install...');
    }

    const YTDLP YTDLP_BIN_BIN_URL =_URL = 'https://github 'https://github.com/.com/yt-dlp/yt-dlp/releases/lyt-dlp/yt-dlp/releases/latest/download/yt-dlpatest/download/yt-dlp';
   ';
    const termuxBin = '/ const termuxBin = '/data/data/com.data/data/com.termux/files/usr/bin/yttermux/files/usr/bin/yt-dlp';
    const prefix-dlp';
    const prefixBin = `${process.env.PBin = `${process.env.PREFIX ||REFIX || ''}/bin/yt-d ''}/bin/yt-dlp`;
lp`;
    const homeBin   = `${process.env.H    const homeBin   = `${process.env.HOME   || ''}/binOME   || ''}/bin/yt-dlp`;

   /yt-dlp`;

    const allMethods = const allMethods = [
        { cmd: ' [
        { cmd: 'pip3pip3 install -U y install -U yt-dlp',                                    desc: 't-dlp',                                    desc: 'pip3 -U' },
        {pip3 -U' },
        { cmd: 'pip3 install cmd: 'pip3 install --upgrade yt-d --upgrade yt-dlp',                             desclp',                             desc: 'pip3: 'pip3 --upgrade' },
        { cmd --upgrade' },
        { cmd: 'pip3 install -: 'pip3 install -U --break-systemU --break-system-packages yt-dlp',            desc:-packages yt-dlp',            desc: 'pip3 -- 'pip3 --break-system-packages' },
break-system-packages'        { cmd: ' },
        { cmd: 'pip install -pip install -U yU yt-dlp',t-dlp',                                     desc                                     desc: 'pip -U': 'pip -U' },
        { cmd: 'python3 - },
        { cmd: 'python3m pip install -U -m pip install -U yt-dlp yt-dlp',                         ',                          desc: 'python3 -m pip desc: 'python3 - -U' },
        { cmd: 'pythonm pip -U' },
        { cmd: 'python3 -m pip install -3 -m pip install -U --break-system-packagesU --break-system-packages yt yt-dlp-dlp',  desc:',  desc: 'python 'python3 -3 -m pip --breakm pip --break-system-p-system-packages' },
       ackages' },
        { cmd { cmd: 'python -: 'python -m pipm pip install -U y install -U yt-dlp',t-dlp',                           desc: 'python -                           descm pip -U' },
: 'python -m pip -U        {' },
        { cmd: cmd: 'sudo pip3 'sudo pip3 install - install -U yt-dU yt-dlp',lp',                               desc: '                               desc: 'sudo pipsudo pip3 -U' },
        { cmd3 -U' },
        { cmd: 'sudo python: 'sudo python3 -m pip install -3 -m pipU y install -U yt-dlp',                    t-dlp',                     desc: 'sudo python desc: 'sudo python3 -m pip -U' },
3 -m pip -U' },
        { cmd: 'pip        { cmd: 'pip3 install3 install yt-dlp',                                       yt-dlp',                                       desc: 'pip desc: 'pip3 fresh' },
3 fresh' },
        { cmd: 'pkg install -y yt-dlp',                                     desc: 'p        { cmd: 'pkg install -y yt-dlp',                                     desc: 'pkg install' },
        { cmd: 'pkg upgradekg install' },
        { cmd: 'pkg upgrade -y && pkg install -y && pkg install -y -y yt-dlp yt-dlp',                  ',                   desc: desc: 'pkg upgrade 'pkg upgrade+install+install' },
        { cmd:' },
        { 'apt install -y yt-dlp', cmd: 'apt install -y yt-d                                     desclp',                                     desc: ': 'apt install (termapt install (termux)' },
        { cmd: 'apt updateux)' },
        { cmd: 'apt update -y && apt -y && apt install - install -y yt-dlp',                    descy yt-dlp',: 'apt update                    desc: 'apt update+install+install (termux)' (termux)' },
        { cmd: 'sudo apt },
        { cmd: 'sudo apt install - install -y yy yt-dlp',                                desc: 't-dlp',                                desc: 'sudo apt install' },
       sudo apt install' },
        { cmd: ' { cmd: 'sudo apt update && sudo apt install -y ysudo apt update && sudo apt install -y yt-dlp',             desct-dlp',             desc: 'sudo apt update+: 'sudo apt update+install' },
        { cmdinstall' },
        { cmd: 'sudo apt-get install -y yt: 'sudo apt-get install -y yt-dlp',                           -dlp',                            desc: 'sudo apt-get desc: 'sudo apt-get install' },
        { cmd install' },
        { cmd: 'sudo apt: 'sudo apt-get update-get update && sudo apt-get install -y y && sudo apt-get install -y yt-dlp',t-dlp',     desc: 'sudo apt     desc: 'sudo apt-get update+install' },
        { cmd:-get update+install' },
        { cmd: 'sudo snap 'sudo snap install install yt yt-dlp',                                  desc: 'snap install-dlp',                                  desc: 'snap install' },
        { cmd:' },
        { cmd: 'sudo 'sudo pacman -S pacman -S --noconfirm yt-d --noconfirm yt-dlp',                         desc: 'lp',                         desc: 'pacman -S' },
        { cmd:pacman -S' },
        { cmd: 'sudo pacman -S 'sudo pacmanyu -- -Syu --noconfirm ytnoconfirm yt-dlp',                      -dlp',                       desc: desc: 'pacman - 'pacman -SyuSyu' },
        { cmd: 'yay -' },
        { cmd: 'yay -S --noconS --firmnoconfirm yt yt-dlp',                                -dlp',                                 desc: 'yay ( desc: 'yay (AUR)' },
        {AUR)' },
        { cmd: cmd: 'paru -S --nocon 'paru -S --firm yt-dlpnoconfirm yt-dlp',                                desc: 'par',                                desc: 'paru (AUR)' },
        {u (AUR)' },
        { cmd: 'apk add cmd: 'ap ytk add-dlp',                                            desc: yt-dlp',                                            desc: 'apk add' },
 'apk add' },
        { cmd:        { cmd: 'ap 'apk update && apk addk update && ap yt-dlpk add yt-dlp',                              desc: 'ap',                              desc: 'apk update+addk update' },
+add' },
        {        { cmd: cmd: 'sudo dnf install -y y 'sudo dnf install -y yt-dlp',t-dlp',                                desc                                desc: 'dnf install' },
        { cmd: 'dnf install' },
        { cmd: ': 'sudo dnf upgrade -y && sudosudo dnf upgrade -y && sudo dnf install -y yt-d dnf install -y ylp',         desc: 't-dlp',         desc: 'dnf upgrade+install' },
        { cmd: 'dnf upgrade+install' },
        { cmd: 'sudo ysudo yum install -y yt-dlp',                               um install -y yt-dlp',                                desc: desc: 'y 'yum install' },
        {um install' },
 cmd:        { cmd: 'sudo yum update - 'sudo yum update -y && sudo yum install -y yt-dlp',y && sudo yum install -y yt-dlp',          desc: 'yum update          desc:+install 'yum update+install' },
       ' },
        { cmd: 'sudo { cmd: 'sudo zypper install zypper install -y yt-dlp -y yt-dlp',                             desc: 'zy',                            pper install desc: 'zypper install' },
        {' },
        { cmd: 'sudo zy cmd: 'sudopper refresh zypper refresh && sudo zy && sudo zypper install -ypper install -y yt-dlp',      yt-dlp',      desc: 'zypper refresh desc: 'zy+installpper refresh+install' },
' },
        { cmd: 'sudo xbps        { cmd: 'sudo xbps-install-install -y yt-dlp',                               desc: -y yt-dlp 'x',                               desc: 'xbps install' },
bps install' },
        {        { cmd: 'sudo xbps cmd: 'sudo xbps-install -Sy-install yt-dlp',                              desc: 'xbps sync+install' },
        { -Sy yt-dlp',                              desc: 'xbps sync+install' },
        { cmd: 'brew cmd: 'brew install yt-dlp', install yt-dlp',                                       desc: '                                       desc: 'brew install' },
brew install' },
        {        { cmd: 'brew upgrade yt-dlp', cmd: 'brew upgrade yt-dlp',                                       desc                                       desc: 'brew upgrade' },
        {: 'brew upgrade' },
        { cmd: 'sudo cmd: 'sudo port install yt-dlp port install yt-dlp',                                  desc:',                                  desc: 'macports install 'macports install' },
        { cmd:' },
        { cmd: 'winget install 'winget install -e --id -e --id yt yt-dlp-dlp.yt-dlp.yt-dlp -h -- -h --accept-source-agreements', desc:accept-source-agreements', 'wing desc: 'winget'et' },
        { cmd },
        { cmd: ': 'chocochoco install yt-dlp - install yt-dlp -y',                                   descy',                                   desc: ': 'chocolatey'chocolatey' },
        { cmd },
        { cmd: 'sco: 'scoop installop install yt yt-dlp-dlp',                                      desc: 'scoop',                                      desc: 'scoop' },
        { cmd:' },
        { cmd: `curl `curl -L "${YTDLP_BIN_URL}" -o -L "${YTDLP_BIN_URL}" -o /usr /usr/local/bin/yt-dlp && ch/local/bin/yt-dlp && chmod a+rx /usr/local/binmod a+rx /usr/local/bin/yt-dlp`,  desc: 'binary curl → /usr/local/bin/yt-dlp`,  desc: 'binary curl → /usr/local/bin' },
        { cmd: `w' },
        { cmd: `wget -q "${get -q "${YTDLP_BIN_URLYTDLP_BIN_URL}" -}" -O /usr/local/bin/O /usr/local/bin/yt-dyt-dlp && chmodlp && chmod a+ a+rx /usr/localrx /usr/local/bin/yt-d/bin/yt-dlp`,  desc: 'binary wget → /usrlp`,  desc: 'binary wget → /usr/local/bin' },
        { cmd:/local/bin' },
        { cmd: `curl `curl -L "${YTDLP_BIN -L "${YTDLP_BIN_URL}"_URL}" -o -o /usr/bin/ /usr/bin/yt-dlp && chmodyt-dlp && a+ chmod a+rx /rx /usr/bin/ytusr/bin-dlp`,             /yt-dlp`,              desc: 'binary curl → desc: 'binary curl → /usr/bin' },
        /usr { cmd/bin' },
        { cmd: `: `wgetwget -q "${YTDLP -q "${YT_BINDLP_BIN_URL}" -O /usr/bin/_URL}" -O /usr/bin/yt-dyt-dlp && chmod a+rx /lp && chmod a+rx /usr/binusr/bin/yt-dlp/yt`,             -dlp`,              desc: desc: 'binary wget → / 'binary wget → /usr/binusr/bin' },
' },
        { cmd:        { cmd: `curl -L `curl -L "${YTDLP_BIN "${YTDLP_BIN_URL}" -o_URL}" -o "${termuxBin "${termuxBin}" &&}" && chmod a+rx "${ chmod a+rx "${termuxBin}"`,               termuxBin}" desc: 'binary curl → termux bin' },
       `,                desc: 'binary curl → termux bin' },
        { cmd { cmd: `: `wget -qwget "${YTDLP -q "${YTDLP_BIN_BIN_URL}"_URL}" -O -O "${termuxBin}" && "${termuxBin}" && chmod a+ chmod a+rx "${termuxrx "${termuxBin}"`,                desc:Bin}"`,                desc: 'binary 'binary wget → term wget → termux binux bin' },
        {' },
        { cmd: cmd: `curl -L `curl -L "${YTDLP_BIN_URL}" "${YTDLP_BIN_URL}" -o -o "${prefix "${prefixBin}"Bin}" && chmod a+rx "${prefix && chmod a+rx "${prefixBin}"Bin}"`,                desc:`,                desc: 'binary curl → PREFIX 'binary curl → PREFIX/bin' },
        { cmd/bin' },
        { cmd: `wget: `wget -q -q "${YTDLP_BIN "${YTDLP_BIN_URL}" -O_URL}" -O "${prefixBin}" && ch "${prefixBin}" && chmod a+rxmod a+rx "${prefixBin}"`,                "${prefixBin}"`,                desc: 'binary wget desc: 'binary wget → PREFIX/bin → PREFIX/bin' },
        {' },
 cmd: `mkdir -p        { cmd: `mkdir -p "${homeBin.replace "${home(/\/yt-dlp$Bin.replace(/\/yt-dlp$/, '/, '')}"')}" && curl -L "${YT && curl -L "${YTDLP_BIN_URL}"DLP_BIN_URL}" -o "${home -o "${homeBin}"Bin}" && ch && chmod a+rxmod a+rx "${homeBin}" "${home`, desc: 'Bin}"`, desc: 'binary curl → ~binary curl → ~/bin/bin' },
' },
        {        { cmd: cmd: `mkdir -p `mkdir -p "${homeBin.replace(/\/ "${homeBin.replace(/\/yt-dlp$/, 'yt-dlp$/, '')}" && wget -q "${YTDL')}" && wget -q "${YTDLP_BP_BIN_URL}" -O "${homeBin}" && chmodIN_URL}" -O "${homeBin}" && chmod a+rx "${homeBin a+rx "${}"`,homeBin}"`, desc: 'binary wget desc: 'binary wget → ~/bin → ~/bin' },
' },
    ];

    let    ];

 attempt = 0;
       let attempt = 0 for (;
    for (const method of allMethods) {
       const method of allMethods) {
        attempt++;
        try {
            attempt++;
        try {
            log.info(` log.info(`[${attempt[${attempt}/${all}/${allMethods.length}] ${Methods.length}] ${method.desc}`);
method.d            execSync(method.cmd,esc}`);
            execSync(method.c { stdio:md, { stdio: 'pipe', timeout 'pipe', timeout: 120000, shell: 120000, shell: '/: '/bin/bash' });

            if (commandbin/bash' });

            ifExists('yt-d (commandExists('yt-dlp')) {
                try {
lp')) {
                try {
                    const ver = execSync('yt-dlp                    const ver = execSync('yt --version', { encoding:-dlp --version', { 'utf8', timeout: encoding: 'utf8', 500 timeout: 5000 }).trim();
                    log0 }).trim();
                    log.success(`.success(`✅ yt-d✅ yt-dlp ${ver} — installationlp ${ver} — installation/update successful! (/update successfulmethod:! (method: ${method.desc})`);
                } ${method.desc})`);
                } catch {
                    log catch {
                    log.success('✅ yt-dlp install.success('✅ yt-dlp install/update successful!/update successful');
                }
                return true!');
                }
               ;
            return true;
            }
        } catch (e) {
            log.warn }
        } catch (e) {
            log.warn(`✗ [${attempt}] ${(`✗ [${attempt}] ${method.dmethod.desc}`);
        }
    }

esc}`);
        }
    }

    log.error('❌    log.error('❌ yt-dlp yt-dlp installation — all methods failed. Bot will run with limited functionality installation — all methods failed. Bot will run with limited functionality.');
    return false;
}

// ═════════════════════════.');
    return false;
}

// ═══════════════════════════════════════════════════════════
//══════════════════════════════════
// 🔐 AUTO 🔐 AUTO PERMISSIONS SETUP PERMISSIONS SETUP
// ─ sudo NOPASSWD
// ─ sudo NOPASSWD, PATH fix, PATH fix, Termux storage, file, Termux storage, file permissions
// permissions
// ═ ═══════════════════════════════════════════════════════════════════════════════════

══════════════════════════════════

async functionasync function autoSetup autoSetupPermissions(osInfo)Permissions(osInfo) {
    {
    log.header('🔐 Permissions and log.header('🔐 Permissions and environment setup');

    const isRoot    = process environment setup');

    const isRoot   .getuid ? process.getuid = process.getuid ? process.getuid() === 0 : false() === 0;
    : false;
    const is const isTermux  =Termux  = osInfo.type === osInfo.type === 'termux';
 'termux';
    const    const currentUser = ( currentUser() => {
        = (() => {
        try { return execSync('whoami try { return execSync('whoami', { encoding: 'utf8',', { encoding: 'utf8', stdio: 'pipe' }).trim stdio: 'pipe' }).trim(); } catch { return '(); } catch { return 'root'; }
    })();

root'; }
    })();

    log    log.info(`User: ${currentUser} | Root.info(`User: ${current: ${User} | Root: ${isRootisRoot} | Platform: ${osInfo.display} | Platform: ${osInfo.display}`);

    // ─}`);

    // ── 1. sudo N─ 1. sudo NOPASSOPASSWD setup (forWD setup (for non-root non-root users) users) ───────
    ───────
    if (!isRoot if (!isRoot && !isTermux && && !isTermux && osInfo.type !== 'just osInforunmy') {
.type !== 'justrunmy') {
        log        log.info('Setting up sudo NOPASSWD....info('Setting up sudo NOPASSWD...');
        const sudo');
       ersMethods = [
 const sudoersMethods = [
            `echo "${currentUser            `echo "${currentUser} ALL=(ALL) NOPASSWD:ALL"} ALL=(ALL) NOPASSWD:ALL" | sudo tee / | sudo tee /etc/sudoers.d/netc/sudoers.d/nopasswd-${currentopasswd-${currentUser} > /User} > /dev/null && sudo chmod 440 /etc/sudodev/null && sudo chmod 440 /etcers.d/nop/sudoers.d/nopasswd-${asswd-${currentUser}`,
            `echo "${currentUser}`,
            `currentUser} ALLecho "${currentUser} ALL=(ALL) NOPASS=(ALL) NOPASSWD:WD:ALL" | sudo tee -a /etc/sudoersALL" | sudo tee -a /etc/sudoers > / > /dev/null`,
            `sudo mkdir -p /etc/sudodev/null`,
            `sudo mkdir -p /etc/sudoers.ders.d && echo "${currentUser} ALL=( && echo "${currentUser} ALL=(ALL) NOPALL) NOPASSASSWD:ALL" | sudo tee /etcWD:ALL" | sudo tee /etc/sudoers.d/sudoers.d/90-nopasswd > /dev/null`,
       /90-nopasswd > / ];
        for (dev/null`,
        ];
        for (const cmdconst cmd of sudoersMethods of sudoersMethods) {
            try {
                execSync(cmd, {) {
            try {
                execSync(cmd, { stdio: 'pipe', stdio: 'pipe', shell: '/bin/bash', timeout: shell: '/bin/bash', timeout: 100 10000 });
                log00 });
                log.success('.success('sudo NOPASSWD successfullysudo NOPASSWD successfully configured configured!');
!');
                break                break;
           ;
            } catch { /* try next */ }
 } catch { /* try next */ }
        }
    }

    // ─        }
    }

    // ── ─ 2. PATH environment variable correction2. PATH environment variable correction ────────────────────────────
    log.info ────────────────────────────
    log.info('Correcting PATH...');
    const('Correcting PATH...');
 pathExtras = [
        '/usr    const pathExtras = [
        '/usr/local/bin',
       /local/bin '/usr',
       /bin',
        '/bin',
        '/usr/local '/usr/bin',
        '/bin',
        '/usr/local/sbin',
        '/usr/sbin/sbin',
       ',
        `${process.env.HOME || '/usr/sbin',
        `${process.env.HOME || ''}/bin`,
        `${process.env ''}/bin`,
        `${process.env.HOME.HOME || ''}/. || ''}/.local/binlocal/bin`,
        `${process`,
        `${process.env.PREFIX || ''}/.env.PREFIX ||bin`,
 ''}/bin`,
        '/        '/data/data/com.data/datatermux/files/usr/bin/com.termux/files/usr/bin',
    ].filter(Boolean',
    ].filter(Boolean);

    const currentPath =);

    const currentPath process.env.PATH || '';
 = process.env.PATH    const || '';
    const newPaths = pathExtras.filter(p => !currentPath newPaths = pathExtras.filter(p => !currentPath.includes(p));
    if (.includes(p));
    if (newPaths.length > 0) {
newPaths.length > 0        process) {
.env.PATH = [...newPaths, currentPath        process.env.PATH = [...newPaths, currentPath].join(':');
        log].join(':');
        log.success(`PATH updated: ${.success(`newPaths.join(',PATH updated: ${newPaths.join(', ')} ')}`);
    }

   `);
    }

    // profile // profile files: files: .bashrc .profile .bash_profile .bashrc .profile .bash_profile
    const profileFiles =
    const profileFiles = [
        `${process.env.H [
        `${process.env.HOME || ''}/OME || ''}/.bashrc`,
        `${process.env.bashrc`,
        `${process.env.HOME.HOME || ''}/.bash_profile || ''`,
        `${process.env.HOME ||}/.bash_profile`,
        `${process.env.H ''}/OME || ''}/.profile.profile`,
        `${process.env.P`,
        `${process.env.PREFIX ||REFIX || ''}/ ''}/etc/bash.bashrc`,
    ].filter(petc/bash.bashrc`,
    ].filter(p => p => p && ! && !p.startsWith('/etc'p.startsWith('/etc'));

    const pathLine =));

    const pathLine = `export PATH="${pathExt `export PATH="${pathExtras.joinras.join(':')}:$PATH"`;
    for ((':')}:$PATH"`;
    for (const profile of profileFiles)const profile of profileFiles) {
        try {
            if {
        try {
            if (fs (fs.existsSync(profile)) {
.existsSync(profile)) {
                const existing = fs.readFileSync                const existing = fs.readFileSync(profile, '(profile, 'utf8');
                if (!existing.includesutf8');
                if (!existing.includes('yt-dlp') && !existing('yt-dlp') &&.includes(path !existing.includes(pathExtras[0])) {
                    fs.appendFileExtras[0])) {
                    fs.appendFileSync(profile,Sync(profile, `\n# nmd `\n# nmd-axis bot PATH\n${path-axis bot PATH\n${pathLine}\Line}\n`);
                }
            }
n`);
                }
            }
        } catch { /* skip */ }
    }

    // ──         } catch { /* skip */ }
    }

    // ── 3.3. Termux special permissions ─ Termux special permissions ────────────────────────────────────────────────────────────────────
   ───
    if (isTerm if (isTermux)ux) {
        log.info('Termux permissions {
        log.info('Termux permissions setup... setup...');
       ');
        const term const termuxCmds = [
            'termux-setup-stuxCmds = [
            'termux-setup-storage 2>/dev/null || true',
            'amorage 2>/dev/null || true',
            'am broadcast - broadcast -a android.intent.action.Ba android.intent.action.BOOTOOT_COMPLETED 2>/_COMPLETED 2>/dev/null || true',
            'chdev/null || true',
            'chmod -R 755 /data/data/com.termuxmod -R 755 /data/data/com.termux/files/usr/bin/files/usr/bin 2>/dev/null || true',
 2>/dev/null || true',
            'termux-wake-lock 2>/dev            'termux-wake-lock 2>/dev/null || true',
        ];
/null || true',
        for (const cmd of termux        ];
        for (const cmd of termuxCmds) {
            try { execSyncCmds) {
            try(cmd, { execSync(c { stdio: 'pipe', shell: '/md, { stdio: 'pipe', shellbin/bash', timeout: : '/bin/bash', timeout: 80080000 }); } catch { /* skip */ }
        }
        log.success }); } catch { /* skip */ }
        }
        log.success('Termux permissions successfully configured('Termux permissions successfully configured!');
    }

    // ── 4.!');
    }

    // ── 4. apt/pkg update + upgrade (repo refresh) ──────── apt/pkg update + upgrade (repo refresh) ────────
    log.info('Up
    log.info('Updating/upgraddating/upgrading package repository...');
   ing package repository...');
    const updateMethods = [
        const updateMethods = [
        'pkg update -y 'pkg update -y 2>/dev/null || true',
 2>/dev/null ||        'apt update -y true',
        'apt update -y 2 2>/dev/null || true',
        '>/dev/null || true',
        'sudo apt update -y sudo apt update -y 2>/dev/null || true2>/dev/null || true',
        'sudo apt-get',
        'sudo apt-get update -y 2>/ update -y 2>/dev/null || true',
       dev/null || true',
        'sudo pacman -Sy --n 'sudo pacman -Sy --noconfirm 2>/dev/nulloconfirm 2>/dev/null || true',
        'apk update 2 || true',
        'apk update 2>/dev/null || true',
>/dev        '/null || true',
        'sudo dnf check-update 2>/devsudo dnf check-update 2>/dev/null || true',
        '/null || true',
sudo yum check-update        'sudo y 2>/dev/null ||um check-update 2>/dev/null || true',
        ' true',
        'sudo zsudo zypper refresh ypper refresh 2>/2>/dev/nulldev/null || true || true',
        'sudo xbps-install -S',
        'sudo xbps-install -S 2>/dev/null || true',
        'brew update 2>/dev/null 2>/dev/null || true',
        'brew update 2 || true',
    ];
>/dev/null || true',
    ];
    for    for (const cmd of updateMethods) {
        try (const cmd of updateMethods) {
        try { execSync(cmd, { execSync(cmd, { stdio: 'pipe { stdio: 'pipe', shell: '/bin/bash', timeout', shell: '/bin/bash', timeout: 60000: 60000 }); } catch { /* skip */ }); } catch { /* skip */ }
    }
    log.success('Repository }
    }
    log.success('Repository update successful!');

    // ─ update successful!');

─ 5.    // ── 5. pip / pip / python permissions fix ─────────────────────────────────── python permissions fix ───────────────────────────────────
   
    log.info('Fixing pip permissions... log.info('Fixing pip');
    const pipPermCmds = permissions...');
    const pipPermCmds = [
        'rm -f [
        'rm -f /usr/lib/python3*/ /usr/lib/python3*/EXTERNEXTERNALLY-MANAGED 2>/dev/null || true',
       ALLY-MANAGED 2>/dev/null || true',
        'find /usr/lib/python3* -name 'find /usr/lib/python3* -name EXTERNALLY-M EXTERNALLY-MANAGANAGED -delete ED -2>/dev/null || truedelete 2>/dev/null || true',
        'sudo',
        'sudo rm -f / rm -f /usr/lib/python3*/EXTERNALLY-MANAGED 2>/dev/null || true',
usr/lib/python3*/EXTERNALLY-MANAGED 2>/dev/null || true',
        'rm        'rm -f /usr/lib -f /usr/lib/python3*//python3*/EXTERNALLY-MANAGED 2>/dev/null || true',
        `rm -EXTERNALLY-MANAGED 2>/dev/null || true',
        `rm -f ${process.env.PREFIX || ''}/lib/python3*/EXf ${process.env.PREFIX || ''}/lib/python3*/EXTERNALLYTERNALLY-MANAGED 2>/dev-MANAGED 2>/dev/null || true`,
       /null || true 'pip3`,
        'pip3 install -- install --upgrade pip --upgradebreak-system-packages 2 pip --break-system-packages 2>/dev>/dev/null || true',
/null || true',
        '        'python3 -mpython3 -m pip install pip install --upgrade pip --upgrade pip --break-system-packages  --break-system-packages 2>/dev/null || true2>/dev/null || true',
        'pip3 install',
        'pip3 install --upgrade pip 2 --upgrade pip 2>/dev/null || true',
>/dev/null || true',
    ];
    for (const    ];
    for (const cmd of pipPermCmds) {
        try { exec cmd of pipPermCmds) {
        try { execSync(cmd, { stdSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: io: 'pipe', shell: '/bin/bash', timeout: 30000 }); } catch { /*30000 }); } catch { /* skip */ }
    }
    skip */ }
    }
    log.success('pip permissions successfully log.success('pip permissions successfully fixed!');

    // ── 6. fixed!');

    // ─ /usr/local/bin write permissions ────────────────────────────
   ─ 6. /usr/local/bin write permissions ─ log.info('Fixing /usr/local/bin write permissions...───────────────────────────
    log.info('Fixing /usr/local/bin write permissions...');
    const binPermCm');
    const binPermCmds =ds = [
        'sudo [
        chmod 777 /usr/local/bin 'sudo chmod 777 /usr/local/bin 2>/dev/null || 2>/dev/null || true',
 true',
        'sudo ch        'sudo chown -R $(whoami) /usr/local/bin own -R $(whoami) /usr/local/bin 2>/2>/dev/null || true',
        `sudodev/null || true',
        `sudo mkdir mkdir -p /usr -p /usr/local/bin/local/bin && sudo chmod 755 && sudo /usr/local/bin 2 chmod 755 /usr/local/bin>/dev/null || true`,
 2>/dev/null || true`,
    ];
    ];
    for (const    for (const cmd of cmd of binPermCmds) {
        try { execSync(cmd, binPermCmds) {
        try { execSync(cmd, { stdio: 'pipe', shell: '/ { stdio: 'pipe', shell: '/bin/bash', timeoutbin/bash', timeout: 10000 }); } catch { /* skip */ }
    }

    // ──: 10000 }); } catch { /* skip */ }
    }

    // ── 7. node_modules permissions 7. node_modules permissions ────────────────────────────────────
    log.info('Fixing node ────────────────────────────────────
    log.info('Fixing node_modules permissions_modules permissions...');
...');
    try    try {
        execSync(`chmod -R 755 "${ {
        execSync(`chmod -R path.join(__dirname,755 "${ 'node_modulespath.join(__dirname, 'node_modules')}" 2>/dev/null || true`,')}" 2>/dev { stdio: 'pipe/null || true`, { std', timeout: io: 'pipe', timeout: 15000 });
    } catch15000 });
    } catch { /* { /* skip */ skip */ }

    }

    log.success('✅ Permissions log.success('✅ Permissions and environment setup complete!\n');
}

// and environment setup complete!\n');
}

// ═════════════════ ═══════════════════════════════════════════════════════════
══════════════════════════════════════════
//// 🔄 AUTO GIT 🔄 AUTO GIT PULL PULL — GitHub repo update checker
// Checks GitHub — GitHub repo update checker
// every 5 minutes
 Checks GitHub every 5 minutes
// If new commits exist,// If new commits does git pull and restarts the bot exist, does git pull and restarts the bot
//
// ═════ ═════════════════════════════════════════════════════════════════════════════════════════════════════════════════

const REPO

const REPO_URL   _URL    = 'https:// = 'github.com/nmd-axis/nhttps://github.com/nmd-axis/nima.gitima.git';
const CHECK_INTERVAL';
const CHECK_IN_MSTERVAL_MS = 5 * 60 = 5 * 60 *  * 1000; //1000; // 5 minutes
let gitPullProcess = null;

function 5 minutes
let gitPullProcess = null isGit;

function isGitRepo()Repo() {
    try {
 {
    try {
        exec        execSync('git revSync('git rev-parse --is-parse --is-inside-work-tree', { stdio-inside-work-tree: 'pipe', cwd', { stdio: 'pipe', cwd: __dirname,: __dirname, timeout: 5000 });
 timeout: 5000 });
        return true;
    } catch {        return true;
    } catch { return false; }
}

function return false; }
}

function ensureGitSetup() {
    ensureGitSetup() {
    if ( if (isGitRepo())isGitRepo()) return;
    log.info('Preparing return;
    log.info('Preparing Git repository...');
 Git repository...');
    try    try {
        execSync(`git {
        execSync(`git init && git remote add origin init && git remote add origin ${REPO_URL ${REPO_URL}`, { stdio:}`, { stdio: 'pipe 'pipe', cwd: __dirname', cwd: __dirname, timeout: 15000, timeout: 15000 });
        execSync(`git });
        execSync(`git fetch origin main --depth= fetch origin main --depth=1`, { stdio:1`, { stdio: 'pipe', c 'pipe', cwd: __dirname, timeout: wd: __dirname, timeout: 30000 });
        execSync30000 });
        execSync(`git reset --hard origin(`git reset --hard origin/main`, { stdio:/main`, { stdio: 'pipe 'pipe', cwd: __dirname, timeout: 15000', cwd: __dirname, timeout: 15000 });
        log.success('Git repository successfully });
        log.success('Git repository successfully prepared! prepared!');
   ');
    } catch (e) {
 } catch (e        log.warn('Git) {
        log.warn('Git setup failed: ' + e setup failed: ' + e.message);
    }
}

function.message);
    }
}

function getCurrent getCurrentCommit() {
    try {
        return execSync('gitCommit() {
    try {
        return execSync('git rev-parse HEAD', { rev-parse HEAD', { encoding: 'utf encoding: 'utf8', stdio: 'pipe', cwd: __8', stdio: 'pipe', cwd: __dirname, timeout: 500dirname, timeout:0 }). 5000 }).trim();
trim();
    } catch {    } catch { return null return null; }
; }
}

function getRemoteCommit()}

function getRemoteCommit() {
    try {
        execSync(' {
    try {
        execgit fetch origin mainSync('git fetch origin main --quiet', { stdio: ' --quiet', { stdiopipe',: 'pipe', cwd cwd: __dirname, timeout: 300: __dirname, timeout:00 });
 30000 });
        return execSync        return execSync('git rev-('git rev-parse originparse origin/main', { encoding/main', { encoding: 'utf8: 'utf8', stdio: 'pipe', cwd: __dirname', stdio: 'pipe', cwd: __dirname, timeout, timeout: 5000 }).trim: 5000();
    } catch }).trim();
    } catch { return null; }
}

async function doGit { return null; }
}

async functionPull(childProcess) {
    doGitPull(childProcess) log.header('🔄 GitHub {
    log.header('🔄 GitHub update — update — git pulling');

    git pulling');

    const pullMethods = const pullMethods = [
        'git pull origin main --rebase [
        'git pull origin main --rebase',
       ',
        'git pull origin main',
        'git 'git pull origin main',
        ' pull --force origin maingit pull --force origin main',
        'git fetch origin main &&',
        'git fetch origin main && git reset --hard git reset --hard origin/main origin/main',
        'git fetch --',
        'git fetch --all && git reset --hardall && git reset origin/main',
    ];

    --hard origin/main',
    let pulled = false;
    for ( ];

    let pulled = false;
    for (const cmd of pullMethods)const cmd of pullMethods) {
        {
        try {
            log.info(`Attempting: ${cmd}`);
            execSync(cmd, try {
            log.info(`Attempting: ${cmd}`);
            exec { stdio: 'pipe', cSync(cmd, { stdio: 'pipe', cwd:wd: __dirname, timeout: 60000 __dirname, timeout: , shell: '/bin/bash' });
60000, shell: '/bin/bash' });
            pulled            pulled = true;
            = true;
            log.success log.success('✅ git pull('✅ git pull successful! successful!');
           ');
            break;
        } catch ( break;
        } catch (e) {
            log.warn(`✗ ${cmd}`);
        }
    }

    if (!pullede) {
            log.warn(`✗ ${cmd}`);
        }
    }

    if (!pulled) {
        log.warn) {
        log.warn('All git pull methods failed('All git pull methods failed — skipping restart');
 — skipping restart');
        return        return;
    }

    // npm;
    }

    // npm install — if package.json changed install — if package.json changed
    try {
        log
    try {
        log.info('Running npm install (checking.info('Running npm install ( for new dependencies)...');
       checking for new dependencies)...');
        execSync('npm install -- execSync('npm install --prefer-offline --noprefer-offline-audit --legacy --no-audit --legacy-peer-deps', {
            stdio-peer-deps', {
            stdio: 'pipe', cwd: 'pipe', cwd: __dirname,: __dirname, timeout: 120000
 timeout: 120000
        });
        log.success('npm install        });
        log.success('npm install successful! successful!');
   ');
    } catch (e } catch (e) {
        log.warn) {
        log.warn('npm install warning: '('npm install warning + e: ' + e.message);
.message);
    }

    //    }

    // Kill child Kill child process and restart
 process and    log.info(' restart
    log.info('Restarting bot (newRestarting bot version)...');
    (new version)...');
    if ( if (childProcess && !childProcesschildProcess && !childProcess.killed) {
.killed) {
        child        childProcess.kill('SIGProcess.kill('SIGTERMTERM');
   ');
    }
}

function startAutoGitPull(get }
}

function startAutoGitChildProcess) {
Pull(getChildProcess) {
    // DISAB    // DISABLED — auto git pull off, prevents bot shutdown issues
    log.wLED — auto git pull off, prevents bot shutdown issues
    log.warn('arn('🔄🔄 Auto git pull DISABLED — GitHub Auto git pull DISABLED — GitHub check turned off');
    return null;
}

async check turned off');
    return null;
}

async function autoInstallDependencies() {
    const osInfo = detectOS();
    
    log function autoInstallDependencies() {
    const osInfo = detectOS();
    
    log.header(`🤖🦊 MAUREON.header(`🤖🦊 MAUREONIX startingIX starting\n\n${chalk.yellow(`Platform: ${osInfo.display}`)}`);

    //${chalk.yellow(`Platform: ${osInfo.display}`)}`);

    // 🔐 STEP 1: 🔐 STEP 1: Permissions Permissions & Environment (first!)
    try {
 & Environment (first!)
           await autoSetupPermissions(osInfo);
 try {
        await autoSetupPermissions(osInfo);
    }    } catch (e) {
        catch (e) {
        log.warn('Permissions setup log.warn('Permissions setup failed, continuing...');
    }

    // 🔧 STEP failed, continuing...');
    }

    // 🔧 STEP 2: System 2: System upgrade + Node.js + Python
    log.header('🔧 System upgrade + Node.js + Python
    log.header('🔧 System Package Upgrade & Node.js/Python Installation Package Upgrade & Node.js/Python Installation');
    
    try {
        await autoUpgrade');
    
    try {
        await autoSystemPackUpgradeSystemPackages(osInfo);
        await autoInstallNodeJS(osInfo);
        await autoages(osInfo);
        await autoInstallNodeJSInstallPython(osInfo);
   (osInfo);
        await autoInstallPython(osInfo } catch);
    (e) {
        log.warn } catch (e) {
        log.warn('System upgrade/install failed, continuing...');
    }

('System upgrade/install failed, continuing...');
    }

    // 📥 STEP     // 📥 STEP 3: yt-dlp — install / update3: yt-dlp — install / upgrade every bot start
    try {
        / update / upgrade every bot start
    try {
        await installOrUpdate await installYtOrUpdateYtDlp(osInfo);
   Dlp(osInfo);
    } catch (e } catch (e) {
        log.warn) {
        log('yt-dlp install/update failed: '.warn('yt-dlp install/update failed + e.message);
    }

    // Check npm
   : ' + e.message);
    }

    // Check npm if (!
    if (!checkNpmInstcheckNpmInstalled()) {
       alled()) {
        log.error('npm not found!');
        log.info(`Reinst log.error('npm not found!');
        log.info(`Reinstalling Nodealling Node.js...\n`);
        
        const nodeMethods = {
.js...\n`);
        
        const nodeMethods = {
            termux: [
                           termux: [
                'pkg update -y && p 'pkg update -ykg install -y nodejs',
                'apt update - && pkg install -y nodejs',
                'apty && apt install update -y && apt install -y -y nodejs'
            ],
            nodejs'
            ],
            ubuntu: [
 ubuntu: [
                'sudo apt update &&                'sudo apt update && sudo apt install -y nodejs npm',
                'sudo apt-get update && sudo apt-get install -y nodejs npm',
                'sudo snap sudo apt install -y nodejs npm',
                'sudo apt-get update && sudo apt-get install -y nodejs npm',
                ' install node --classic'
            ],
            wsudo snap install node --classic'
sl:            ],
            wsl: [
                'sudo [
                'sudo apt update && sudo apt install -y nodejs apt update && sudo apt install -y nodejs npm',
                'winget npm',
                'winget install OpenJS. install OpenNodeJS'
            ],
            macos: [
                'JS.NodeJS'
            ],
            macos: [
brew update && brew install node',
                               'brew update && brew install node',
                'curl - 'curlo- https://raw.githubusercontent.com/nvm -o- https://raw.githubusercontent.com/nvm-sh/n-sh/nvm/v0.39.vm/v0.39.0/install.sh | bash0/install.sh | bash'
            ],
            linux:'
            ],
            linux: [
                'sudo [
                'sudo apt update && sudo apt install -y nodejs apt update && sudo apt install -y nodejs npm',
                'sudo yum install npm',
                'sudo yum install -y -y nodejs npm',
                'sudo d nodejs npm',
                'nf installsudo dnf install -y -y nodejs npm',
                'sudo pac nodejs npm',
                'sudo pacman -S --noconfirmman -S --noconfirm nodejs npm'
            ]
 nodejs npm'
            ]
        };

        const methods =        };

        const methods = nodeMethods[osInfo.type nodeMethods[osInfo.type] ||] || nodeMethods.linux;
        
        let npmInstalled = false;
        for (const method of methods) {
            try {
 nodeMethods.linux;
        
        let npmInstalled = false;
        for (const method of methods) {
            try {
                log                log.info(`Attempting Node.js installation...`);
               .info(`Attempting Node.js installation...`);
                execSync execSync(method, {(method, { stdio stdio: 'inherit', timeout: 180000 });
: 'inherit', timeout                
                if (: 180000 });
                
                if (checkNcheckNpmInstpmInstalled()) {
                    log.successalled()) {
                    log.success('Node.js successfully('Node.js successfully installed!');
                    npmInstalled = installed!');
                    npmInstalled = true;
 true;
                    break;
                                   break;
                }
            } catch }
            } catch (e) {
                log.warn (e) {
                log.warn('Attempt('Attempt failed');
            }
 failed');
            }
        }

        }

        if (!npm        if (!npmInstalledInstalled) {
            log.warn('npm install failed) {
            log.warn('npm install failed — bot will — bot will continue starting continue starting...');
        }
    }

...');
        }
    }

    log.success('npm found    log.success('npm found!');

    // Check!');

    // Check package.json package.json
    const packageJsonPath = path
    const packageJsonPath = path.join(__.join(__dirname, 'packagedirname, 'package.json');
.json');
    if (!fs.existsSync(packageJsonPath    if (!fs.existsSync(packageJsonPath)) {
)) {
        log.warn(`package.json not found —        log.warn(`package.json not found — skipping...`);
        return;
    }

 skipping...`);
        return;
    }

    // Read package.json
    // Read package.json
    let packageJson;
    try {
        package    let packageJson;
   Json = JSON.parse try {
        packageJson = JSON.parse(f(fs.readFileSync(ps.readFileSync(packageJsonPath, 'utfackageJsonPath, 'utf8'));
    } catch (e) {
       8'));
    } catch (e) {
        log.w log.warn('arn('package.jsonpackage.json parse error — skip parse error — skip: ' + e.message);
        return: ' + e.message);
        return;
   ;
    }

    const dependencies }

    const dependencies = packageJson.dependencies || = packageJson.dependencies || {};
    const dependencyNames = {};
    const dependencyNames = Object.keys(dependencies);

    log.info(`Checking all npm packages: ${chalk.yellow(d Object.keys(dependencies);

    log.info(`Checking all npm packages: ${chependencyNames.length)}alk.yellow(dependencyNames.length)}``);

);

    //    // Check each dependency
    let missingPack Check each dependency
    let missingPackages =ages = [];
    let installed [];
   Count = 0;

    let installedCount = 0 console.log('\n📦;

    console.log('\n Checking npm packages...📦 Checking npm packages...\n');

    for (\n');

    for (const pkg of dependencyNames) {
        ifconst pkg of dependencyNames) {
 (checkPackageInst        if (checkPackageInstalled(pkg))alled(pkg)) {
            console.log {
            console.log(`  ${chalk.green('✓')} ${(`  ${chalk.green('✓')} ${pkg}`);
           pkg}`);
            installedCount installedCount++;
        } else++;
        } else {
            {
            console.log(`  ${ch console.log(`  ${chalk.red('alk.red('✗')✗')} ${pkg}`);
           } ${pkg}`);
            missingPackages.push missingPackages.push(pkg(pkg);
        }
   );
        }
    }

    console.log }

    console.log(`\n${chalk.cyan('Installed:')}(`\n${chalk.cyan('Installed:')} ${inst ${installedalledCount}/${dependencyNames.lengthCount}/${dependencyNames.length}`);

    // If missing}`);

    // If missing packages found, install packages found, install with multiple retry methods
    if (missingPackages with multiple retry methods
    if (missingPackages.length > 0) {
        log.length > 0) {
        log.warn(`${missingPackages.length}.warn(`${missingPackages.length} missing NPM packages found!`);
 missing NPM packages found!`);
        console.log(`\n        console.log(`\nMissing:\n${missingPackMissing:\n${ages.map(p => ` missingPackages.map(p => `  • ${ • ${chalk.yellow(p)}`).join('\chalk.yellow(p)}`).n')join('\n')}\n}\n`);

        log`);

        log.info('.info('Starting installation...\n');

        let installSuccessStarting installation...\n');

        let installSuccess = false;
        let attempts =  = false;
        let attempts = 0;
0;
        const maxAttempt        const maxAttempts = 5;
        
s = 5        const;
        
        const npmMethods npmMethods = [
            'npm install --pre = [
            'npm install --prefer-offline --no-afer-offline --no-audit --legacy-peerudit --legacy-peer-deps --force-deps --force',
           ',
            'npm 'npm install -- install --legacy-peer-dlegacy-peer-deps',
            'npm install --force',
            'npmeps',
            'npm install --force',
            'npm ci --legacy-peer-deps',
            ' ci --legacy-peer-deps',
rm -rf node_modules package-lock            'rm -rf node_modules package-lock.json && npm install.json && npm install'
       '
        ];

        while (! ];

        while (!installSuccess && attempts < maxAttempts) {
            attempts++;
            try {
                log.header(`installSuccess && attempts < maxAttempts) {
            attempts++;
            try {
                log.header(`📥 npm install attempt ${attempts}/${maxAttempts📥 npm install attempt ${attempts}/${maxAttempts}`);
                
                if (attempts > 1) {
                    try {
                       }`);
                
                if (attempts > 1) {
                    try execSync('npm {
                        execSync cache clean('npm cache clean --force', {
 --force', {
                            std                            stdio: 'pipe',
                           io: 'pipe',
                            cwd: __dirname
                        });
                        log cwd: __dirname
                        });
                        log.info('npm cache cleared');
                    } catch (.info('npm cache cleared');
                    } catch (e) {}
                }
                
e) {}
                }
                
                const                const method = npmMethods[attempts - 1] || npmMethods method = npmMethods[attempts - 1] || npmMethods[npmMethods.length - [npmMethods.length - 1];
                log.info(`1];
                log.info(`Method: ${chalk.Method: ${chalkcyan(method)}`);
                
                exec.cyan(method)}`);
                
                execSync(method, {
                   Sync(method, {
                    stdio: 'inherit',
                    cwd: stdio: 'inherit',
                    c __dirname
                });

                installSuccesswd: __dirname
                });

                installSuccess = true = true;
                log.success;
                log.success('('All NPM packages installed!');
            } catch (e)All NPM packages installed!');
            } catch ( {
                log.error(`Attempte) {
                log.error(`Attempt ${attempt ${attempts} failed`);
                
               s} failed`);
                
                if (attempts < max if (attempts < maxAttempts) {
                    logAttempts) {
                    log.info(`${maxAttempts - attempts} attempts remaining.info(`${maxAttempts -... retrying...`);
                    attempts} attempts remaining... retrying... await new Promise(resolve => setTimeout(res`);
                    await new Promise(resolve => setTimeout(resolve,olve, 2000));
 2000));
                               } else {
                    log.warn } else {
                    log('npm packages install failed —.warn('npm packages install failed — bot will bot will continue starting...');
                }
            }
        }
 continue starting...');
                }
            }
    } else {
        log.success('All npm packages already        }
    } else {
        log.success('All npm packages already installed! installed!');
   ');
    }

    // Check }

    system dependencies and auto-install if missing
    // Check system dependencies and auto-install if missing
    log.header('🔧 Checking system dependencies log.header('🔧 Checking');
    
    // system dependencies');
 ═════════════════════════    
    // ════════════════════════════════════════════════════════════════════════════════════════════
    // 🔧 SYSTEM═══
    // 🔧 SYSTEM DEPENDENCIES (2026 DEPENDENCIES (2026 - Updated for - Updated for 50+ 50+ YT methods)
    // YT methods)
    // Mandatory: ffmpeg, python3, y Mandatory: ffmpeg, python3t-dlp
    //, yt-dlp
    // Optional: Optional: youtube-dl, youtube-dl, curl/w curl/wget, aria2c, soxget, aria2c, sox, node-fetch, node-fetch (npm)
    // ═════════ (npm)
    // ════════════════════════════════════════════════════════════════════════════════════════════════════════════
    const mandatory═══
    const mandatorySysDeps = ['ffSysDeps = ['ffmpeg'];
    const optionalmpeg'];
    const optionalSysDSysDeps = {
        'curl':        'HTTP streaming +eps = {
        'curl':        'HTTP streaming + API calls API calls (50+ methods (50+ methods)',
        'wget':       )',
        'wget':        'direct file download fallback (method 29) 'direct file download fallback (method ',
        'git29)',
        'git':         'version control',
':         'version control',
        'spotify        'spotifydl':dl':   'Spotify track download (.spotify command)',
        'imagem   'Spotify track download (.spotify command)',
        'imagemagick': 'image processing / sticker creation',
agick': 'image processing / sticker creation',
        'ghostscript':        'ghostscript': 'PDF/document processing',
        'y 'PDF/document processing',
       outube-dl':  'YT download fallback 'youtube-dl':  'YT download fallback (methods 9-14 (methods 9-14)',
        'aria2c':      'multi-th)',
        'aria2c':      'multi-thread download (method 29read download (method)',
        ' 29)',
        'soxsox':         'audio format conversion (method 30 fallback':         'audio format conversion (method 30 fallback)',
        'ffprobe':)',
        'ffprobe':     'media info detection (     'media info detection (usually bundled with ffmpegusually bundled with ffmpeg)'
    };

    let)'
    };

    let missingMandatory = missingMandatory = [];
    let missing [];
    let missingOptional = [];

   Optional = [];

    // Check mandatory system dependencies
    for // Check mandatory system dependencies
    for (const (const cmd of cmd of mandatorySysDeps) {
        if (commandExists(c mandatorySysDeps) {
        if (commandExists(cmd)) {
            console.log(` md)) {
            console.log(`  ${chalk.green(' ${chalk.green('✓')} ${cmd.padEnd(12)} - mandatory`);
✓')} ${cmd.padEnd(12)} - mandatory`);
        } else {
        } else {
            console            console.log(`  ${chalk.log(`  ${chalk.red('✗.red('✗')} ${cmd.pad')} ${cmd.padEnd(End(12)} - mandatory12)} - mandatory`);
            missingMandatory.push(cmd);
        }
    }

    // Check`);
            missingMandatory.push(cmd);
        }
    }

    optional system dependencies
 // Check optional system dependencies
    for (const [cmd    for (const [cmd, desc] of Object., desc] of Object.entries(optionalSysDeps)) {
entries(optionalSysDeps        if (commandExists(c)) {
        if (commandmd)) {
            console.logExists(cmd)) {
           (`  ${chalk.green(' console.log(`  ${chalk.g✓')} ${cmd.padEnd(12)} - ${descreen('✓')} ${cmd.padEnd(12)} - ${desc}`);
        } else {
            console.log}`);
        } else {
            console.log(`  ${ch(` alk.red('✗')} ${cmd.p ${chalk.red('✗')} ${cmd.padEnd(12)} -adEnd(12)} - ${desc}`);
            missingOptional.push(cmd);
        }
    }

 ${desc}`);
            missingOptional.push(cmd);
        }
    }

    //    // Handle missing mandatory dependencies
    if (missingMandatory.length > 0) {
        log.error Handle missing mandatory dependencies
    if (missingMandatory.length > 0) {
        log.error(`\n❌ Missing(`\n❌ Missing mandatory dependencies: ${ mandatory dependencies: ${missingMandmissingMandatory.join(', ')}`);
        
        const installCmdsatory.join(', ')}`);
        
        const installCmds = getInstallCommands(osInfo = getInstallCommands(osInfo, missingMandatory);
        
        const, missingMandatory);
        
        const isRoot isRoot = process.getuid && process.getuid = process.getuid && process.getuid() === 0;
        
        if (osInfo.type === '() === 0;
        
        if (osInfo.type === 'termux' && isRoottermux' &&) {
            log.warn('⚠ isRoot) {
            log.warn('⚠️ Term️ Termux root user detectedux root user detected - trying - trying alternate methods...');
            log alternate methods...');
            log.info('Trying all installation.info('Trying all installation methods... methods...\n');
            
            const rootMethods\n');
            
            const = [
                'apt update -y && apt install - rootMethods = [
                'apt update -y && apty ff install -y ffmpegmpeg',
                'apt',
                'apt-get update -y && apt-get update -y && apt-get install -y ffm-get install -ypeg',
                ' ffmpeg',
                'apt upgradeapt upgrade -y && apt install - -y && apt install -y ffmpeg',
               y ffmpeg',
                'apt 'apt full-upgrade - full-upgrade -y && apt install -yy && apt install -y ffmpeg',
                ' ffmpeg',
                'apt-get upgrade -y &&apt-get upgrade -y && apt-get install -y ff apt-get install -y ffmpeg',
                'apk updatempeg',
                'apk update && apk add ffmpeg',
                'apt clean && apt autoclean && apt && apk add ffmpeg',
                'apt clean && apt autoclean && apt update && apt install -y update && apt install -y ffmpeg',
                'sed -i "s/^deb ffmpeg',
                'sed -i "s/ http/de^deb http/debb [trusted [trusted=yes=yes] http/" /etc/apt/sources.list] http/" /etc/apt/s && apt update && apt installources.list && apt -y ffmpeg 2>/ update && apt install -y ffmpeg dev/null || apt install -2>/dev/null || apty ffmpeg'
 install -y ff            ];
            
            for (let i =mpeg'
            ];
            
 0; i            for (let i = 0; i < rootMethods.length; i < rootMethods.length; i++) {
                const cmd =++) {
                const cmd = rootMethods[i];
                try {
                    log.info(`[${i rootMethods[i];
                try {
                    log.info(`[${i + 1}/${rootMethods.length}] + 1}/${rootMethods.length}] ${chalk.cyan(c ${chalk.cyan(cmd.substring(0, md.substring(0, 80))}`);
                    execSync80))}`);
                    execSync(cmd, { 
                        stdio(cmd, { 
                        stdio: 'inherit',
: 'inherit',
                        shell: '/bin/bash                        shell: '/',
                       bin/bash',
                        timeout: timeout: 60000
                    });
 60000
                    });
                    
                    if (commandExists                    
                    if (commandExists('ffmpeg')) {
('ffmpeg')) {
                        log.success('\n✅ ffm                        log.success('\n✅ ffmpeg installed successfully (peg installed successfully (root userroot user)!\n');
                        return;
                    }
                } catch)!\n');
                        return;
                    }
                } catch (e) {
 (e                    log.warn('Failed, trying next method...');
) {
                    log.warn('Failed, trying next method...');
                }
                }
            }
            
                       }
            
            log.info log.info('\nTrying('\nTrying standard ff standard ffmpeg installation functionmpeg installation function...\...\n');
        }
n');
        }
            console.log(`\n${ch            console.log(`\n${chalk.cyan(`${alk.cyan(`${osInfoosInfo.display} - Installing mandatory dependencies.display} - Installing mandatory dependencies:`)}`);
            console.log(` :`)}`);
            console.log(`  ${chalk.yellow( ${chinstallCmds.update)}`);
alk.yellow(installCmds.update)}`);
            console.log(`  ${            console.log(`  ${chalk.yellow(installCmdschalk.yellow(install.installCmds.install)}\n`);
            
            let mandatoryInstallSuccess =)}\n`);
            
            let mandatoryInstallSuccess = false;
            
            if (missingMandatory.includes('ffmpeg false;
            
            if (')) {
                log.header('📥missingMandatory.includes('ffmpeg')) {
                log.header('📥 ffmpeg installation - trying all methods ffmpeg installation - trying');
                all methods');
                mandatoryInstallSuccess = mandatoryInstallSuccess = await installFFmpeg(os await installFFmpeg(osInfo);
           Info);
            } else {
 } else {
                let mandAttempts = 0;
                               let mandAttempts = 0;
                const maxMandAttempts = const maxMandAttempts = 3;
                
                while (!mand 3;
                
                while (!mandatoryInstallSuccess && mandAttempts < maxMandatoryInstallSuccess && mandAttempts < maxMandAttemptsAttempts) {
                    mandAttempts++;
                    try {
                        if (os) {
                    mandAttempts++;
                    try {
                        if (osInfo.type !== 'macosInfo.type !== 'macos') {
                            try {
                                log.info(`Attempt') {
                            try {
                                log.info ${mandAttempts}: Updating packages(`Attempt ${mandAttempts}: Up...`);
                                execSync(dating packages...`);
                                execSync(installCmds.update, {installCmds.update stdio: 'inherit' });
                           , { stdio: 'inherit' });
                            } catch (e) {
                                log.warn } catch (e) {
                                log('Package update failed.warn('Package update failed, attempting, attempting installation anyway...');
                            }
 installation anyway...');
                            }
                        }
                        
                        log.info(`                        }
                        
                        log.info(`AttemptAttempt ${mand ${mandAttemptsAttempts}: Installing}: Installing ${missingMandatory.join(', ')} ${missingMandatory.join(', ')}...`);
...`);
                        execSync(installCmds.install,                        execSync(installCmds.install, { stdio: 'inherit' });
 { stdio: 'inherit' });
                        
                                               
                        mandatoryInstallSuccess = true;
                        log.success('Mandatory dependencies successfully installed! mandatoryInstallSuccess = true;
                        log.success('Mandatory dependencies successfully installed!');
                   ');
                    } catch (e) {
                        if (mandAttempts < maxMandAttempt } catch (e) {
                        if (mandAttempts < maxMandAttempts)s) {
                            log.w {
                            log.warn(`arn(`Attempt ${mandAttempts} failed,Attempt ${mandAttempts} failed, retrying...`);
                            await retrying...`);
                            await new Promise(resolve => setTimeout new Promise(resolve => setTimeout(resolve, 2000));
                        }
                   (resolve, 2000));
                        }
                    }
                }
            }
            
            }
                }
            }
            
            if if (!mand (!mandatoryInstallSuccess) {
                log.warn('\n⚠️ ffmpegatoryInstallSuccess) {
                log.warn('\n⚠️ ff install failed — bot will continuempeg install failed — bot starting...');
            will continue starting...');
            }
    }

    // 🎵 optional tools }
    }

    // 🎵 optional tools — flat method list without platform — flat method list without platform check
    const optionalTools check
    const optionalToolsList =List = missingOptional.filter(tool =>
 missingOptional.filter(tool =>
        ['yt-dlp',        ['yt-dlp', 'youtube-dl', 'spotifydl', 'wget 'youtube-dl', 'spotifydl', 'wget', 'aria2c',', 'aria2c', 'sox'].includes(tool)
    );

    if (optionalToolsList.length > 'sox'].includes(tool)
    );

    if (optionalToolsList 0) {
        log.warn.length > 0) {
        log(`\n🎵 Missing.warn(`\n🎵 Missing optional tools optional tools: ${optionalToolsList.join(', ': ${optionalToolsList.join)}`);

        for ((', ')}`);

       const tool for (const tool of optionalToolsList) {
            log.header(`📥 Installing ${tool}` of optionalToolsList) {
            log.header(`📥 Installing ${);

            // correct package name mapping
tool}`);

            // correct package name            const pkgName = tool === 'aria2c mapping
            const pkgName = tool === 'aria2c' ? 'aria' ? 'aria2'2' : tool : tool;

           ;

            const YTDLP_BIN_URL = 'https:// const YTDLP_BIN_URL = 'https://github.com/yt-dlp/yt-dlp/releasesgithub.com/yt-dlp/yt-dlp/latest/download/yt-d/releases/latest/download/lp';
            const termuxBin = '/data/data/com.termyt-dlp';
            const termuxBin = '/data/data/com.termux/filesux/files/usr/bin//usr/bin/yt-dyt-dlp';
            const prefixBin = `${lp';
            const prefixBin = `${process.env.PREFIX || ''}/bin/ytprocess.env.PREFIX || ''}/bin/yt-dlp-dlp`;

            // build flat method list per`;

            // build flat method list per tool
 tool
            const toolMethods = [];

            // pip / python (python-based tools)
            if (['yt-dlp',            const toolMethods = [];

            // pip / python (python-based tools)
            if (['yt-dlp', 'y 'youtube-doutube-dl', 'spotl', 'spotifydl'].includes(toolifydl'].includes(tool)) {
)) {
                toolMethods.push                toolMethods.push(
                   (
                    { cmd: `pip3 { cmd: `pip3 install - install -U --U --break-system-packages ${tool}`,           desc: `pip3 --breakbreak-system-packages ${tool}`,           desc: `pip3 --break-system-packages` },
                    { cmd: `pip3-system-packages` },
                    { cmd: `pip3 install -U ${tool}`,                                   desc: install -U ${tool}`,                                   `pip3 -U` },
                    { cmd: ` desc: `pip3 -U` },
                    { cmdpip3 install ${tool}: `pip3 install ${`,                                     tool}`,                                      desc: `pip desc: `pip3 fresh` },
                    { cmd: `pip3 fresh` },
                    { cmd: install -U --break-system `pip install -U --break-system-packages ${tool}`,            desc-packages ${tool}`,: `pip --break-system-packages            desc: `pip --break-system-packages` },
` },
                    { cmd: `pip                    { cmd: `pip install -U ${tool}`,                                    desc: install -U ${tool} `pip -U`,                                    desc: `pip -U` },
` },
                    { cmd: `python3 -m pip                    { cmd: `python3 -m pip install - install -U --U --break-systembreak-system-packages-packages ${tool}`, desc: ${tool `python3 -m pip}`, desc: `python3 -m pip --break --break-system-packages`-system-packages` },
                    },
                    { cmd: ` { cmd: `python3python3 -m pip install -U -m pip install ${tool}`,                         desc: `python3 -U ${tool -m pip -U` },
                    { cmd: `sudo pip3 install -U --break-system-packages ${tool}`,      desc: `sudo pip3 --break-system-packages` },
                    { cmd: `sudo pip3 install -U ${tool}`,                              desc: `sudo pip3 -U` },
                );
                if (tool === 'yt-dlp') {
                    toolMethods.push(
                        { cmd: `curl -L "${YTDL}`,                         desc: `python3 -m pip -U` },
                    { cmd: `sudo pip3 install -U --break-system-packages ${tool}`,      desc: `sudo pip3 --break-system-packages` },
                    { cmd: `sudo pip3 install -U ${tool}`,                              desc: `sudo pip3 -U` },
                );
                if (tool === 'yt-dlp') {
                    toolMethods.push(
                        { cmd: `curl -L "${YTDLP_BIN_URL}" -P_BIN_URL}" -o /o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`,usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`, desc: 'binary curl → desc: 'binary /usr curl → /usr/local/bin/local/bin' },
                        {' },
                        { cmd: cmd: `wget -q "${ `wget -q "${YTDLP_BYTDLP_BIN_URLIN_URL}" -O /usr/local/bin/yt-dlp && chmod}" -O /usr/local/bin/yt-dlp && a+rx /usr/local/bin/yt-dlp`, chmod a+rx /usr/local/bin/yt-dlp`, desc: 'binary wget → / desc: 'binary wget → /usrusr/local/bin' },
                        { cmd/local/bin' },
                       : `curl -L "${ { cmd: `curl -L "${YTDLP_BIN_URL}" -o "${termuxBinYTDLP_BIN_URL}" -o "${termuxBin}"}" && chmod a+rx && chmod a+rx "${termuxBin}"`,               desc: 'binary curl "${termuxBin}"`,               desc → term: 'binary curl → termuxux'' },
                        },
                        { cmd: `wget -q "${YT { cmd: `wget -q "${YTDLPDLP_BIN_URL}"_BIN_URL}" -O -O "${termuxBin}" && "${termuxBin}" && chmod a+rx "${termuxBin}" chmod a+rx "${termux`,               desc: 'binary wgetBin}"`,               desc: 'binary wget → termux' },
                        { cmd: → termux' },
                        { cmd: `curl -L `curl -L "${YTDLP_BIN_URL "${YTDLP_BIN_URL}" -}" -o "${prefixBino "${prefixBin}" && chmod a+rx "${prefixBin}" && chmod a+rx "${prefixBin}"`,}"`,               desc: '               desc: 'binary curlbinary curl → PREFIX/bin' },
                    );
 → PREFIX/bin' },
                }
                    );
                }
            }

            // system package managers —            }

            // system package managers — try all try all regardless of platform
 regardless of platform
            tool            toolMethods.pushMethods.push(
                { cmd: `(
                { cmd: `pkg install -y ${pkg install -pkgName}`,                              desc: `py ${pkgName}`,                              desc: `pkg (kg (termux)` },
                { cmd:termux)` },
 `apt install -y ${pkg                { cmd: `apt install -y ${pkgName}`,                              desc: `aptName}`,                              desc: `apt (term (termux)` },
                { cmd: `ux)` },
                { cmdapt update: `apt update -y && apt install -y ${ -y && apt install -y ${pkgName}`,            pkgName}`,             desc: `apt desc: `apt update+install (termux)` },
                { cmd: `sudo apt install -y ${p update+install (termux)` },
                { cmd: `sudo apt install -y ${pkgName}`,                         desc: `sudo apt` },
kgName}`,                         desc: `                {sudo apt` },
                { cmd: `sudo apt update cmd: `sudo apt update && sudo apt install -y && sudo apt install -y ${pkgName}`,      desc ${pkgName}`,      desc: `sudo apt update+install`: `sudo apt update+install` },
                },
                { cmd: ` { cmd: `sudo aptsudo apt-get install -y ${pkgName}`,-get install -y ${pkgName                     desc: `sudo apt}`,                     desc: `sudo apt-get`-get` },
                { cmd },
                { cmd: `: `sudo pacman -S --noconsudo pacman -S --noconfirm ${pkgName}`,firm ${pkgName                  desc: `pacman` },
                {}`,                  desc: `pacman` },
                { cmd: `apk add ${p cmd: `apk add ${pkgName}`,                                     desc: `apkkgName}`,                                     desc: `apk` },
                { cmd: `sudo` },
                { cmd: `sudo dnf install -y ${pkgName}`,                         desc: dnf install -y ${pkgName}`,                         desc: `dnf` },
                `dnf` },
                { cmd: `sudo yum install -y ${pkgName { cmd: `sudo yum install -y ${p}`,                         desc: `kgName}`,                         desc: `yum` },
                { cmd: `sudoyum` },
                { cmd: `sudo zypper install -y ${pkgName zypper install -y ${pkgName}`,}`,                      desc: `                      desc: `zypperzypper` },
                { cmd: `sudo` },
                { cmd: xbps-install -y ${p `sudo xbps-install -y ${kgName}`,                        desc: `pkgName}`,                        desc: `xbps` },
                {xbps` },
                { cmd: cmd: `brew install ${pkg `brew install ${pkgName}`,                                desc: `brew` },
            );

            letName}`,                                desc: `brew` },
            );

            let toolInst toolInstalled =alled = false;
 false;
            for (let            for (let i = i = 0; i < toolMethods.length 0; i < toolMethods.length; i; i++) {
                const++) {
                const m = m = toolMethods[i];
 toolMethods[i];
                try                try {
                    log.info(`[${i {
                    log.info(`[${i+1+1}/${tool}/${toolMethods.length}] ${m.desc}`);
                    execSync(m.cmd, {Methods.length}] ${m.desc}`);
                    execSync(m.cmd, { stdio: 'pipe', timeout: stdio: 'pipe', timeout: 120 120000, shell:000, shell: '/bin/bash' });
                    '/bin/bash' });
                    if (commandExists(tool)) {
                        log.success(` if (commandExists(tool)) {
                        log.success(`✅ ${tool} install successful! (${m✅ ${tool} install successful! (${m.desc})`);
                        toolInstalled = true;
                        break;
.desc})`);
                        toolInstalled = true;
                        break;
                    }
                }                    }
                } catch ( catch (e) {
                    log.warn(`✗ ${m.desc}`);
               e) {
                    log.warn(`✗ ${m }
            }

            if (!.desc}`);
                }
            }

            if (!toolInstalled) {
                log.wtoolInstalled) {
               arn(`⚠️ ${tool} installation failed — bot will log.warn(`⚠️ ${tool} installation failed — bot will continue with limited functionality`);
            }
        continue with limited functionality`);
            }
        }
    }

    // Other }
    }

    // Other optional tools
    const otherOptionalTools = missingOptional.filter(tool optional tools
    const otherOptionalTools = missingOptional.filter(tool => !['yt-dlp', ' => !['yt-dlp', 'youtube-dl', 'spotifydl',youtube-dl', 'spotifydl', 'wget', 'aria 'wget', 'aria2c', 'sox'].includes2c', 'sox'].includes(tool));
   (tool if (otherOptionalTools.length > 0) {
        log.w));
    if (otherOptionalTools.length > 0) {
        log.warn(`arn(`\nMissing other optional tools: ${otherOptionalTools.join\nMissing other optional tools: ${otherOptionalTools.join(', ')}`);

       (', ')}`);

        log.info('✅ Attempting auto-install... log.info('✅ Attempting auto-install...\n\n');
        
        let');
        
        let optionalInstall optionalInstallSuccess = false;
Success =        let optionalAttempts = 0 false;
        let optionalAttempts =;
        const maxOptionalAttempts = 3;
        
        while 0;
        const maxOptionalAttempts = 3;
        
 (!optionalInstallSuccess && optionalAttempts < max        while (!optionalInstallSuccess && optionalAttempts < maxOptionalAttempts) {
            optionalAttemptOptionalAttempts) {
            optionalAttempts++;
            try {
                const optionals++;
            try {
               Cmds = getInstallCommands(osInfo, missingOptional);
 const optionalCmds = getInstallCommands(osInfo, missing                logOptional);
                log.info(`.info(`[Attempt[Attempt ${optionalAttempts}/${max ${optionalAttempts}/${maxOptionalAttempts}] Installing optional dependencies...OptionalAttempts}] Installing optional dependencies...`);
               `);
                console.log(`  console.log(`  ${ch ${chalk.cyan(optionalCmalk.cyan(optionalCmds.install)}\n`);
                
                execSyncds.install)}\n`);
                
(optionalCmds.install, {                execSync(optionalCmds.install, { 
                    stdio: ' 
                    stdio: 'inherit',
                    timeout: 180000,
                    shell: '/bininherit',
                    timeout: 180000,
                    shell: '/bin/bash'
                });
                
               /bash'
                });
                
                optionalInstallSuccess = true;
                log.success('✅ Optional optionalInstallSuccess = true;
                log.success('✅ Optional dependencies installation successful!');
            } catch dependencies installation successful!');
            } catch (e) {
                log (e) {
                log.warn(`Attempt ${optional.warn(`Attempt ${optionalAttempts} failedAttempts} failed — continuing without optional dependencies...`);
            }
        — continuing without optional dependencies...`);
            }
        }
        
        if }
        
        if (!optional (!optionalInstallSuccess) {
            log.info('\InstallSuccess) {
            log.info('\n⚠️ Continuing without these optional dependencies:', missingn⚠️ Continuing without these optional dependencies:', missingOptional.join(', '));
            log.infoOptional.join(', '));
            log.info('Advanced features may be limited('Advanced features may be limited (spotify, advanced tools, etc.) (spotify, advanced tools, etc.)');
        }
    }

    log.success('✅ Setup verification');
        }
    }

    log.success('✅ Setup verification complete!');
}

// Main complete!');
}

// Main process
async function start() process
async function start() {
    try {
        // Check and install dependencies
        await autoInstallD {
    try {
        // Check and install dependencies
        await autoInstallDependencies();

        const osInfo = detectOS();
ependencies();

        const osInfo = detect        log.header(`OS();
        log.header(`🚀 🦊 MA🚀UREONIX starting\n${chalk 🦊 MAUREONIX starting\n${.yellow(`Platform: ${chalk.yellow(`Platform: ${osInfoosInfo.display}`)}`);

        // Start main.display}`)}`);

        // Start application
        let args = main application
        let args = [path [path.join(__dirname, 'index.js'), ...process.join(__dirname, 'index.js'), ...process.argv.slice(2)];
        let.argv.slice(2)];
        let p = spawn p = spawn(process.argv[0], args, {
            stdio(process.argv[0], args, {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
: ['inherit', 'inherit', 'inherit', 'ip        }).on('message',c']
        }). data => {
            if (on('message', data => {
           data === 'reset') {
                console.log(chalk.y if (data === 'resetellow.bold('[BOT') {
                console.log(chalk.yellow.bold('[BOT] Restarting] Restarting...'));
                p...'));
                p.kill();
                start();
            } else if.kill();
                start();
            } (data === ' else if (data === 'uptimeuptime') {
                p') {
                p.send(.send(process.uptime());
            }
       process.uptime());
            }).on('exit', code => {
            if }
        }).on('exit', code => {
            if (code !== 0) {
 (code !== 0) {
                console.error                console.error(chalk(chalk.red.bold(`[B.red.bold(`[BOT] Process exited with code ${code}. Restarting...`));
                setTimeout(() => start(), 3000OT] Process exited with code ${code}. Restarting...`));
                setTimeout(() => start(), 3000);
           );
            } else {
                console.log(chalk.green.bold('[BOT] Process ended } else {
                console.log(chalk.green.bold('[BOT] — restarting... Process ended — restarting...'));
                setTimeout(()'));
                setTimeout(() => start => start(), (), 3000);
           3000 }
        });

       );
            }
        // 🔄 Auto git pull — GitHub update checker start
        start });

        // 🔄 Auto git pull — GitHub update checker start
AutoGitPull(() => p);
    } catch (e        startAutoGitPull(() => p);
    } catch) {
        log.error('Startup (e) {
        log.error('Startup failed: failed: ' + e.message);
        ' + e.message);
        console.error(e console.error(e);
        log.warn(');
        log.warn('🔄 Retrying in 10s...🔄 Retrying in 10s...');
        setTimeout(() => start(), ');
        setTimeout(() => start(), 10000);
    }
}

10000);
    }
}

// Run
start();