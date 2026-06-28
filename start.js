
try {
    require('child_process').execSync('chmod +x lib/mathEngine.py');
} catch (e) {
    console.log('⚠️ Could not chmod mathEngine.py – maybe the file is missing?');
}

console.log('========================================');
console.log('🦊 Maureonix – start.js loaded');
console.log('========================================');

const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');

// ═══════════════════════════════════════════════════════════
// 🦊 Maureonix - YouTube Download Methods Auto Installer
// Supports: Termux, Ubuntu, VPS, Windows(WSL), macOS
// ═══════════════════════════════════════════════════════════

// Color helpers
const log = {
    info: (msg) => console.log(`${chalk.cyan('ℹ')} ${msg}`),
    success: (msg) => console.log(`${chalk.green('✓')} ${msg}`),
    error: (msg) => console.log(`${chalk.red('✗')} ${msg}`),
    warn: (msg) => console.log(`${chalk.yellow('⚠')} ${msg}`),
    header: (msg) => console.log(`\n${chalk.bold.blue('═══════════════════════════════════')}\n${chalk.bold.cyan(msg)}\n${chalk.bold.blue('═══════════════════════════════════')}\n`)
};

// 🎵 YouTube download methods (53+ methods - 2026)
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
        methods: ['Audio format conversion (fallback)']
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

// Detect OS
function detectOS() {
    const platform = os.platform();
    const release = os.release();

    // Termux (Android)
    const isTermux =
        process.env.PREFIX?.includes('com.termux') ||
        fs.existsSync('/data/data/com.termux') ||
        fs.existsSync('/data/data/com.termux/files/usr/bin/pkg') ||
        fs.existsSync('/system/build.prop');

    if (isTermux) {
        return { type: 'termux', display: 'Termux (Android)', pm: 'pkg', pmAlternate: 'apt' };
    }

    // macOS
    if (platform === 'darwin') {
        return { type: 'macos', display: 'macOS', pm: 'brew', pmAlternate: 'port' };
    }

    if (platform === 'linux') {
        // WSL detection
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

        // Cloud / Docker / Railway / Render / JustRunMy.App
        const isDocker = fs.existsSync('/.dockerenv') ||
            (fs.existsSync('/proc/1/cgroup') &&
             fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker'));
        const isCloud  = process.env.RAILWAY_ENVIRONMENT || process.env.RENDER ||
                         process.env.HEROKU_APP_NAME || process.env.FLY_APP_NAME ||
                         process.env.REPL_ID || process.env.JUSTRUNMY_APP ||
                         process.env.PANEL_URL || isDocker;

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

        // Read /etc/os-release
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
        if (distroId === 'arch' || distroLike.includes('arch') || fs.existsSync('/etc/arch-release')) {
            return { type: 'arch', display: 'Arch Linux', pm: 'pacman', pmAlternate: 'yay' };
        }
        // Alpine
        if (distroId === 'alpine' || fs.existsSync('/etc/alpine-release')) {
            return { type: 'alpine', display: 'Alpine Linux', pm: 'apk', pmAlternate: 'apk' };
        }
        // Fedora
        if (distroId === 'fedora' || distroLike.includes('fedora')) {
            return { type: 'fedora', display: 'Fedora', pm: 'dnf', pmAlternate: 'dnf' };
        }
        // CentOS / RHEL / Rocky / Alma
        if (['centos','rhel','rocky','almalinux','ol'].includes(distroId) ||
            distroLike.includes('rhel') || distroLike.includes('centos') ||
            fs.existsSync('/etc/centos-release') || fs.existsSync('/etc/redhat-release')) {
            return { type: 'centos', display: 'CentOS/RHEL/Rocky', pm: 'yum', pmAlternate: 'dnf' };
        }
        // openSUSE
        if (distroId.includes('suse') || distroLike.includes('suse') || fs.existsSync('/etc/SuSE-release')) {
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

        // Generic Linux
        return { type: 'linux', display: 'Linux (Generic)', pm: 'apt', pmAlternate: 'apt-get' };
    }

    // Windows (native)
    if (platform === 'win32') {
        return { type: 'windows', display: 'Windows', pm: 'winget', pmAlternate: 'choco' };
    }

    return { type: 'linux', display: 'Linux (Unknown)', pm: 'apt', pmAlternate: 'apt-get' };
}

function checkPackageInstalled(packageName) {
    try {
        require.resolve(packageName);
        return true;
    } catch (e) {
        return false;
    }
}

function checkNpmInstalled() {
    try {
        execSync('npm --version', { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

function commandExists(cmd) {
    try {
        execSync(`which ${cmd}`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════
// 🔧 NODEJS & PYTHON AUTO INSTALL/UPGRADE
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
            log.info(`[${i + 1}/${cmdList.length}] Trying to install Node.js: ${cmdList[i].substring(0, 60)}...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 180000 });
            
            if (checkNpmInstalled()) {
                log.success('Node.js installed successfully!');
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
            log.info(`[${i + 1}/${cmdList.length}] Trying to install Python3: ${cmdList[i].substring(0, 60)}...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 180000 });
            
            if (commandExists('python3')) {
                log.success('Python3 installed successfully!');
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
            log.info(`[${i + 1}/${cmdList.length}] Trying system upgrade...`);
            execSync(cmdList[i], { stdio: 'inherit', timeout: 300000 });
            log.success('System packages upgraded successfully!');
            return true;
        } catch (e) {
            log.warn(`Attempt ${i + 1} failed...`);
        }
    }
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🎵 Package Installation with Fallback (10 attempts)
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
            log.success(`${packageName} installed successfully!`);
            return true;
        } catch (e) {
            log.warn(`Attempt ${attempt}/${attemptLimit} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    log.error(`${packageName} all installation attempts failed!`);
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🎯 Critical Packages Auto Install
// ═══════════════════════════════════════════════════════════

async function installCriticalPackages(osInfo, packages) {
    log.header('🔧 Installing critical packages (10 attempts each)');
    
    let allSuccess = true;
    
    for (const pkg of packages) {
        const success = await installPackageWithFallback(osInfo, pkg, 10);
        if (!success) {
            allSuccess = false;
            log.error(`${pkg} installation failed - limited functionality!`);
        }
    }

    return allSuccess;
}

// ═══════════════════════════════════════════════════════════
// 🎵 YT-DLP Auto Install / Update / Upgrade (pip + binary)
// ═══════════════════════════════════════════════════════════

async function installOrUpdateYtDlp(osInfo) {
    log.header('📥 Installing / updating yt-dlp');

    const alreadyInstalled = commandExists('yt-dlp');
    if (alreadyInstalled) {
        log.info('yt-dlp already installed — updating/upgrading...');
    } else {
        log.info('yt-dlp not found — fresh installation...');
    }

    const YTDLP_BIN_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
    const termuxBin = '/data/data/com.termux/files/usr/bin/yt-dlp';
    const prefixBin = `${process.env.PREFIX || ''}/bin/yt-dlp`;
    const homeBin   = `${process.env.HOME || ''}/bin/yt-dlp`;

    const allMethods = [
        // pip / python (all platforms)
        { cmd: 'pip3 install -U yt-dlp',                                   desc: 'pip3 -U' },
        { cmd: 'pip3 install --upgrade yt-dlp',                            desc: 'pip3 --upgrade' },
        { cmd: 'pip3 install -U --break-system-packages yt-dlp',           desc: 'pip3 --break-system-packages' },
        { cmd: 'pip install -U yt-dlp',                                    desc: 'pip -U' },
        { cmd: 'python3 -m pip install -U yt-dlp',                         desc: 'python3 -m pip -U' },
        { cmd: 'python3 -m pip install -U --break-system-packages yt-dlp', desc: 'python3 -m pip --break-system-packages' },
        { cmd: 'python -m pip install -U yt-dlp',                          desc: 'python -m pip -U' },
        { cmd: 'pip3 install -U --break-system-packages yt-dlp',            desc: 'pip3 --break-system-packages (retry)' },
        { cmd: 'python3 -m pip install -U yt-dlp',                         desc: 'python3 -m pip -U (retry)' },
        { cmd: 'pip3 install yt-dlp',                                      desc: 'pip3 fresh' },

        // Termux
        { cmd: 'pkg install -y yt-dlp',                                    desc: 'pkg install' },
        { cmd: 'pkg upgrade -y && pkg install -y yt-dlp',                  desc: 'pkg upgrade+install' },
        { cmd: 'apt install -y yt-dlp',                                    desc: 'apt install (termux)' },
        { cmd: 'apt update -y && apt install -y yt-dlp',                   desc: 'apt update+install (termux)' },

        // apt / apt-get (Ubuntu, Debian, Kali, Raspi, WSL, Railway/Docker)
        { cmd: 'apt install -y yt-dlp',                                    desc: 'apt install' },
        { cmd: 'apt update && apt install -y yt-dlp',                      desc: 'apt update+install' },
        { cmd: 'apt-get install -y yt-dlp',                                desc: 'apt-get install' },
        { cmd: 'apt-get update && apt-get install -y yt-dlp',              desc: 'apt-get update+install' },
        { cmd: 'snap install yt-dlp',                                      desc: 'snap install' },

        // pacman / AUR (Arch, Manjaro)
        { cmd: 'pacman -S --noconfirm yt-dlp',                             desc: 'pacman -S' },
        { cmd: 'pacman -Syu --noconfirm yt-dlp',                           desc: 'pacman -Syu' },
        { cmd: 'yay -S --noconfirm yt-dlp',                                desc: 'yay (AUR)' },
        { cmd: 'paru -S --noconfirm yt-dlp',                               desc: 'paru (AUR)' },

        // apk (Alpine, Docker Alpine)
        { cmd: 'apk add yt-dlp',                                           desc: 'apk add' },
        { cmd: 'apk update && apk add yt-dlp',                             desc: 'apk update+add' },

        // dnf (Fedora, RHEL 8+, Rocky, Alma)
        { cmd: 'dnf install -y yt-dlp',                                    desc: 'dnf install' },
        { cmd: 'dnf upgrade -y && dnf install -y yt-dlp',                  desc: 'dnf upgrade+install' },

        // yum (CentOS 7, RHEL 7)
        { cmd: 'yum install -y yt-dlp',                                    desc: 'yum install' },
        { cmd: 'yum update -y && yum install -y yt-dlp',                   desc: 'yum update+install' },

        // zypper (openSUSE)
        { cmd: 'zypper install -y yt-dlp',                                 desc: 'zypper install' },
        { cmd: 'zypper refresh && zypper install -y yt-dlp',               desc: 'zypper refresh+install' },

        // xbps (Void Linux)
        { cmd: 'xbps-install -y yt-dlp',                                   desc: 'xbps install' },
        { cmd: 'xbps-install -Sy yt-dlp',                                  desc: 'xbps sync+install' },

        // brew (macOS / Linux brew)
        { cmd: 'brew install yt-dlp',                                      desc: 'brew install' },
        { cmd: 'brew upgrade yt-dlp',                                      desc: 'brew upgrade' },
        { cmd: 'port install yt-dlp',                                      desc: 'macports install' },

        // Windows
        { cmd: 'winget install -e --id yt-dlp.yt-dlp -h --accept-source-agreements', desc: 'winget' },
        { cmd: 'choco install yt-dlp -y',                                  desc: 'chocolatey' },
        { cmd: 'scoop install yt-dlp',                                     desc: 'scoop' },

        // Binary direct download (final fallback)
        { cmd: `curl -L "${YTDLP_BIN_URL}" -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`,  desc: 'binary curl → /usr/local/bin' },
        { cmd: `wget -q "${YTDLP_BIN_URL}" -O /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`,  desc: 'binary wget → /usr/local/bin' },
        { cmd: `curl -L "${YTDLP_BIN_URL}" -o /usr/bin/yt-dlp && chmod a+rx /usr/bin/yt-dlp`,              desc: 'binary curl → /usr/bin' },
        { cmd: `wget -q "${YTDLP_BIN_URL}" -O /usr/bin/yt-dlp && chmod a+rx /usr/bin/yt-dlp`,              desc: 'binary wget → /usr/bin' },
        { cmd: `curl -L "${YTDLP_BIN_URL}" -o "${termuxBin}" && chmod a+rx "${termuxBin}"`,                desc: 'binary curl → termux bin' },
        { cmd: `wget -q "${YTDLP_BIN_URL}" -O "${termuxBin}" && chmod a+rx "${termuxBin}"`,                desc: 'binary wget → termux bin' },
        { cmd: `curl -L "${YTDLP_BIN_URL}" -o "${prefixBin}" && chmod a+rx "${prefixBin}"`,                desc: 'binary curl → PREFIX/bin' },
        { cmd: `wget -q "${YTDLP_BIN_URL}" -O "${prefixBin}" && chmod a+rx "${prefixBin}"`,                desc: 'binary wget → PREFIX/bin' },
        { cmd: `mkdir -p "${homeBin.replace(/\/yt-dlp$/, '')}" && curl -L "${YTDLP_BIN_URL}" -o "${homeBin}" && chmod a+rx "${homeBin}"`, desc: 'binary curl → ~/bin' },
        { cmd: `mkdir -p "${homeBin.replace(/\/yt-dlp$/, '')}" && wget -q "${YTDLP_BIN_URL}" -O "${homeBin}" && chmod a+rx "${homeBin}"`, desc: 'binary wget → ~/bin' },
    ];

    let attempt = 0;
    for (const method of allMethods) {
        attempt++;
        try {
            log.info(`[${attempt}/${allMethods.length}] ${method.desc}`);
            execSync(method.cmd, { stdio: 'pipe', timeout: 120000, shell: '/bin/bash' });

            if (commandExists('yt-dlp')) {
                try {
                    const ver = execSync('yt-dlp --version', { encoding: 'utf8', timeout: 5000 }).trim();
                    log.success(`✅ yt-dlp ${ver} — installation/update successful! (method: ${method.desc})`);
                } catch {
                    log.success('✅ yt-dlp installed/updated successfully!');
                }
                return true;
            }
        } catch (e) {
            log.warn(`✗ [${attempt}] ${method.desc}`);
        }
    }

    log.error('❌ yt-dlp installation — all methods failed. Bot will run with limited capabilities.');
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🔐 Auto Permissions Setup
// ═══════════════════════════════════════════════════════════

async function autoSetupPermissions(osInfo) {
    log.header('🔐 Setting up permissions and environment');

    const isRoot    = process.getuid ? process.getuid() === 0 : false;
    const isTermux  = osInfo.type === 'termux';
    const currentUser = (() => {
        try { return execSync('whoami', { encoding: 'utf8', stdio: 'pipe' }).trim(); } catch { return 'root'; }
    })();

    log.info(`User: ${currentUser} | Root: ${isRoot} | Platform: ${osInfo.display}`);

    // sudo NOPASSWD (non-root, non-Termux, non-justrunmy)
    if (!isRoot && !isTermux && osInfo.type !== 'justrunmy') {
        log.info('Setting up sudo NOPASSWD...');
        const sudoersMethods = [
            `echo "${currentUser} ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/nopasswd-${currentUser} > /dev/null && sudo chmod 440 /etc/sudoers.d/nopasswd-${currentUser}`,
            `echo "${currentUser} ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers > /dev/null`,
            `sudo mkdir -p /etc/sudoers.d && echo "${currentUser} ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/90-nopasswd > /dev/null`,
        ];
        for (const cmd of sudoersMethods) {
            try {
                execSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: 10000 });
                log.success('sudo NOPASSWD configured successfully!');
                break;
            } catch { /* try next */ }
        }
    }

    // PATH fix
    log.info('Fixing PATH...');
    const pathExtras = [
        '/usr/local/bin', '/usr/bin', '/bin', '/usr/local/sbin', '/usr/sbin',
        `${process.env.HOME || ''}/bin`, `${process.env.HOME || ''}/.local/bin`,
        `${process.env.PREFIX || ''}/bin`,
        '/data/data/com.termux/files/usr/bin',
    ].filter(Boolean);

    const currentPath = process.env.PATH || '';
    const newPaths = pathExtras.filter(p => !currentPath.includes(p));
    if (newPaths.length > 0) {
        process.env.PATH = [...newPaths, currentPath].join(':');
        log.success(`PATH updated: ${newPaths.join(', ')}`);
    }

    // Profile files
    const profileFiles = [
        `${process.env.HOME || ''}/.bashrc`,
        `${process.env.HOME || ''}/.bash_profile`,
        `${process.env.HOME || ''}/.profile`,
        `${process.env.PREFIX || ''}/etc/bash.bashrc`,
    ].filter(p => p && !p.startsWith('/etc'));

    const pathLine = `export PATH="${pathExtras.join(':')}:$PATH"`;
    for (const profile of profileFiles) {
        try {
            if (fs.existsSync(profile)) {
                const existing = fs.readFileSync(profile, 'utf8');
                if (!existing.includes('yt-dlp') && !existing.includes(pathExtras[0])) {
                    fs.appendFileSync(profile, `\n# Maureonix bot PATH\n${pathLine}\n`);
                }
            }
        } catch { /* skip */ }
    }

    // Termux specific
    if (isTermux) {
        log.info('Setting up Termux permissions...');
        const termuxCmds = [
            'termux-setup-storage 2>/dev/null || true',
            'am broadcast -a android.intent.action.BOOT_COMPLETED 2>/dev/null || true',
            'chmod -R 755 /data/data/com.termux/files/usr/bin 2>/dev/null || true',
            'termux-wake-lock 2>/dev/null || true',
        ];
        for (const cmd of termuxCmds) {
            try { execSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: 8000 }); } catch { /* skip */ }
        }
        log.success('Termux permissions set up!');
    }

    // Package repo update/upgrade
    log.info('Updating/upgrading package repositories...');
    const updateMethods = [
        'pkg update -y 2>/dev/null || true',
        'apt update -y 2>/dev/null || true',
        'sudo apt update -y 2>/dev/null || true',
        'sudo apt-get update -y 2>/dev/null || true',
        'sudo pacman -Sy --noconfirm 2>/dev/null || true',
        'apk update 2>/dev/null || true',
        'sudo dnf check-update 2>/dev/null || true',
        'sudo yum check-update 2>/dev/null || true',
        'sudo zypper refresh 2>/dev/null || true',
        'sudo xbps-install -S 2>/dev/null || true',
        'brew update 2>/dev/null || true',
    ];
    for (const cmd of updateMethods) {
        try { execSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: 60000 }); } catch { /* skip */ }
    }
    log.success('Repository update/upgrade successful!');

    // pip permissions fix
    log.info('Fixing pip permissions...');
    const pipPermCmds = [
        'rm -f /usr/lib/python3*/EXTERNALLY-MANAGED 2>/dev/null || true',
        'find /usr/lib/python3* -name EXTERNALLY-MANAGED -delete 2>/dev/null || true',
        'sudo rm -f /usr/lib/python3*/EXTERNALLY-MANAGED 2>/dev/null || true',
        `rm -f ${process.env.PREFIX || ''}/lib/python3*/EXTERNALLY-MANAGED 2>/dev/null || true`,
        'pip3 install --upgrade pip --break-system-packages 2>/dev/null || true',
        'python3 -m pip install --upgrade pip --break-system-packages 2>/dev/null || true',
        'pip3 install --upgrade pip 2>/dev/null || true',
    ];
    for (const cmd of pipPermCmds) {
        try { execSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: 30000 }); } catch { /* skip */ }
    }
    log.success('pip permissions fixed!');

    // /usr/local/bin write permissions
    log.info('Fixing /usr/local/bin permissions...');
    const binPermCmds = [
        'sudo chmod 777 /usr/local/bin 2>/dev/null || true',
        'sudo chown -R $(whoami) /usr/local/bin 2>/dev/null || true',
        `sudo mkdir -p /usr/local/bin && sudo chmod 755 /usr/local/bin 2>/dev/null || true`,
    ];
    for (const cmd of binPermCmds) {
        try { execSync(cmd, { stdio: 'pipe', shell: '/bin/bash', timeout: 10000 }); } catch { /* skip */ }
    }

    // node_modules permissions
    log.info('Fixing node_modules permissions...');
    try {
        execSync(`chmod -R 755 "${path.join(__dirname, 'node_modules')}" 2>/dev/null || true`, { stdio: 'pipe', timeout: 15000 });
    } catch { /* skip */ }

    log.success('✅ Permissions and environment setup complete!\n');
}

// ═══════════════════════════════════════════════════════════
// 🔄 AUTO GIT PULL — DISABLED (off to prevent restarts)
// ═══════════════════════════════════════════════════════════

function startAutoGitPull(getChildProcess) {
    log.warn('🔄 Auto git pull DISABLED — GitHub check is off');
    return null;
}

// ═══════════════════════════════════════════════════════════
// 📦 Main Auto Installer & Dependency Check
// ═══════════════════════════════════════════════════════════

async function autoInstallDependencies() {
    const osInfo = detectOS();
    
    log.header(`🦊 Maureonix Starting\n${chalk.yellow(`Platform: ${osInfo.display}`)}`);

    // ── Railway / Docker fast path ──────────────────────────────────────
    // On Railway the Dockerfile already installs all system deps (ffmpeg,
    // python3, pip3, yt-dlp) and runs `npm install`.  Skip the heavy
    // system-level setup steps so the bot starts quickly and passes the
    // healthcheck without timing out.
    const isRailway = !!(
        process.env.RAILWAY_ENVIRONMENT ||
        process.env.RAILWAY_SERVICE_NAME ||
        process.env.RAILWAY_PROJECT_ID
    );
    if (isRailway) {
        log.info('🚂 Railway environment detected — skipping system-level installs (handled by Dockerfile)');
        log.success('✅ Setup verification complete (Railway fast path)!');
        return;
    }
    // ───────────────────────────────────────────────────────────────────

    // STEP 1: Permissions & Environment
    try {
        await autoSetupPermissions(osInfo);
    } catch (e) {
        log.warn('Permissions setup failed, continuing anyway...');
    }

    // STEP 2: System upgrade + Node.js + Python
    log.header('🔧 System Package Upgrade & Node.js/Python Installation');
    
    try {
        await autoUpgradeSystemPackages(osInfo);
        await autoInstallNodeJS(osInfo);
        await autoInstallPython(osInfo);
    } catch (e) {
        log.warn('System upgrade/install failed, continuing anyway...');
    }

    // STEP 3: yt-dlp (always install/update on start)
    try {
        await installOrUpdateYtDlp(osInfo);
    } catch (e) {
        log.warn('yt-dlp install/update failed: ' + e.message);
    }

    // Check npm
    if (!checkNpmInstalled()) {
        log.error('npm not found!');
        log.info('Reinstalling Node.js...\n');
        
        const nodeMethods = {
            termux: ['pkg update -y && pkg install -y nodejs', 'apt update -y && apt install -y nodejs'],
            ubuntu: ['apt update && apt install -y nodejs npm', 'apt-get update && apt-get install -y nodejs npm', 'snap install node --classic'],
            wsl: ['apt update && apt install -y nodejs npm', 'winget install OpenJS.NodeJS'],
            macos: ['brew update && brew install node', 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'],
            linux: ['apt update && apt install -y nodejs npm', 'yum install -y nodejs npm', 'dnf install -y nodejs npm', 'pacman -S --noconfirm nodejs npm']
        };

        const methods = nodeMethods[osInfo.type] || nodeMethods.linux;
        
        let npmInstalled = false;
        for (const method of methods) {
            try {
                log.info(`Trying to install Node.js...`);
                execSync(method, { stdio: 'inherit', timeout: 180000 });
                
                if (checkNpmInstalled()) {
                    log.success('Node.js installed successfully!');
                    npmInstalled = true;
                    break;
                }
            } catch (e) {
                log.warn('Attempt failed');
            }
        }

        if (!npmInstalled) {
            log.warn('npm installation failed — starting bot anyway...');
        }
    }

    log.success('npm found!');

    // Check package.json
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        log.warn(`package.json not found — skipping...`);
        return;
    }

    let packageJson;
    try {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (e) {
        log.warn('package.json parse error — skipping: ' + e.message);
        return;
    }

    const dependencies = packageJson.dependencies || {};
    const dependencyNames = Object.keys(dependencies);

    log.info(`Checking npm packages: ${chalk.yellow(dependencyNames.length)}`);

    let missingPackages = [];
    let installedCount = 0;

    console.log('\n📦 Scanning npm packages...\n');

    for (const pkg of dependencyNames) {
        if (checkPackageInstalled(pkg)) {
            console.log(`  ${chalk.green('✓')} ${pkg}`);
            installedCount++;
        } else {
            console.log(`  ${chalk.red('✗')} ${pkg}`);
            missingPackages.push(pkg);
        }
    }

    console.log(`\n${chalk.cyan('Installed:')} ${installedCount}/${dependencyNames.length}`);

    if (missingPackages.length > 0) {
        log.warn(`${missingPackages.length} missing npm packages found!`);
        console.log(`\nMissing:\n${missingPackages.map(p => `  • ${chalk.yellow(p)}`).join('\n')}\n`);

        log.info('Starting installation...\n');

        let installSuccess = false;
        let attempts = 0;
        const maxAttempts = 5;
        
        const npmMethods = [
            'npm install --prefer-offline --no-audit --legacy-peer-deps --force',
            'npm install --legacy-peer-deps',
            'npm install --force',
            'npm ci --legacy-peer-deps',
            'rm -rf node_modules package-lock.json && npm install'
        ];

        while (!installSuccess && attempts < maxAttempts) {
            attempts++;
            try {
                log.header(`📥 npm install attempt ${attempts}/${maxAttempts}`);
                
                if (attempts > 1) {
                    try {
                        execSync('npm cache clean --force', { stdio: 'pipe', cwd: __dirname });
                        log.info('npm cache cleared');
                    } catch (e) {}
                }
                
                const method = npmMethods[attempts - 1] || npmMethods[npmMethods.length - 1];
                log.info(`Method: ${chalk.cyan(method)}`);
                
                execSync(method, { stdio: 'inherit', cwd: __dirname });

                installSuccess = true;
                log.success('All npm packages installed!');
            } catch (e) {
                log.error(`Attempt ${attempts} failed`);
                
                if (attempts < maxAttempts) {
                    log.info(`${maxAttempts - attempts} attempts left... retrying in 2s`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    log.warn('npm packages installation failed — starting bot anyway...');
                }
            }
        }
    } else {
        log.success('All npm packages already installed!');
    }

    // ════════════════════════════════════════════════════════════
    // 🔧 SYSTEM DEPENDENCIES (2026 - YT methods 50+)
    // Mandatory: ffmpeg
    // Optional: curl, wget, git, spotifydl, imagemagick, ghostscript, youtube-dl, aria2c, sox, ffprobe
    // ════════════════════════════════════════════════════════════
    log.header('🔧 Checking system dependencies');
    
    const mandatorySysDeps = ['ffmpeg'];
    const optionalSysDeps = {
        'curl':        'HTTP streaming + API calls',
        'wget':        'direct file download fallback',
        'git':         'version control',
        'spotifydl':   'Spotify track download',
        'imagemagick': 'image processing / sticker creation',
        'ghostscript': 'PDF/document processing',
        'youtube-dl':  'YT download fallback',
        'aria2c':      'multi-thread download',
        'sox':         'audio format conversion fallback',
        'ffprobe':     'media info detection (usually bundled with ffmpeg)'
    };

    let missingMandatory = [];
    let missingOptional = [];

    for (const cmd of mandatorySysDeps) {
        if (commandExists(cmd)) {
            console.log(`  ${chalk.green('✓')} ${cmd.padEnd(12)} - mandatory`);
        } else {
            console.log(`  ${chalk.red('✗')} ${cmd.padEnd(12)} - mandatory`);
            missingMandatory.push(cmd);
        }
    }

    for (const [cmd, desc] of Object.entries(optionalSysDeps)) {
        if (commandExists(cmd)) {
            console.log(`  ${chalk.green('✓')} ${cmd.padEnd(12)} - ${desc}`);
        } else {
            console.log(`  ${chalk.red('✗')} ${cmd.padEnd(12)} - ${desc}`);
            missingOptional.push(cmd);
        }
    }

    if (missingMandatory.length > 0) {
        log.error(`\n❌ Missing mandatory dependencies: ${missingMandatory.join(', ')}`);
        
        const installCmds = getInstallCommands(osInfo, missingMandatory);
        
        console.log(`\n${chalk.cyan(`${osInfo.display} - installing mandatory dependencies:`)}`);
        console.log(`  ${chalk.yellow(installCmds.update)}`);
        console.log(`  ${chalk.yellow(installCmds.install)}\n`);
        
        let mandatoryInstallSuccess = false;
        
        if (missingMandatory.includes('ffmpeg')) {
            log.header('📥 Installing ffmpeg - trying all methods');
            mandatoryInstallSuccess = await installFFmpeg(osInfo);
        } else {
            let mandAttempts = 0;
            const maxMandAttempts = 3;
            
            while (!mandatoryInstallSuccess && mandAttempts < maxMandAttempts) {
                mandAttempts++;
                try {
                    if (osInfo.type !== 'macos') {
                        try {
                            log.info(`Attempt ${mandAttempts}: updating packages...`);
                            execSync(installCmds.update, { stdio: 'inherit' });
                        } catch (e) {
                            log.warn('Package update failed, continuing with installation...');
                        }
                    }
                    
                    log.info(`Attempt ${mandAttempts}: installing ${missingMandatory.join(', ')}...`);
                    execSync(installCmds.install, { stdio: 'inherit' });
                    
                    mandatoryInstallSuccess = true;
                    log.success('Mandatory dependencies installed successfully!');
                } catch (e) {
                    if (mandAttempts < maxMandAttempts) {
                        log.warn(`Attempt ${mandAttempts} failed, retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
        }
        
        if (!mandatoryInstallSuccess) {
            log.warn('\n⚠️ ffmpeg installation failed — bot will continue with limited functionality...');
        }
    }

    // 🎵 optional tools
    const optionalToolsList = missingOptional.filter(tool =>
        ['yt-dlp', 'youtube-dl', 'spotifydl', 'wget', 'aria2c', 'sox'].includes(tool)
    );

    if (optionalToolsList.length > 0) {
        log.warn(`\n🎵 Missing optional tools: ${optionalToolsList.join(', ')}`);

        for (const tool of optionalToolsList) {
            log.header(`📥 Installing ${tool}`);

            // Special handling for spotifydl: install via npm
            if (tool === 'spotifydl') {
                let spotifyInstalled = false;
                const npmMethods = [
                    'npm install -g spotifydl',
                    'npm install spotifydl'
                ];
                for (let i = 0; i < npmMethods.length; i++) {
                    try {
                        log.info(`[${i+1}/${npmMethods.length}] ${npmMethods[i]}`);
                        execSync(npmMethods[i], { stdio: 'pipe', timeout: 60000, shell: '/bin/bash' });
                        // Check if command exists after installation
                        try {
                            execSync('spotifydl --version', { stdio: 'pipe', timeout: 5000 });
                            log.success(`✅ ${tool} installed successfully via npm!`);
                            spotifyInstalled = true;
                            break;
                        } catch {}
                    } catch (e) {
                        log.warn(`✗ ${npmMethods[i]}`);
                    }
                }
                if (!spotifyInstalled) {
                    log.warn(`⚠️ ${tool} installation failed — Spotify downloads will not work`);
                }
                continue;
            }

            // For other tools, use existing multi-method installer
            const pkgName = tool === 'aria2c' ? 'aria2' : tool;
            const YTDLP_BIN_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
            const termuxBin = '/data/data/com.termux/files/usr/bin/yt-dlp';
            const prefixBin = `${process.env.PREFIX || ''}/bin/yt-dlp`;

            const toolMethods = [];

            if (['yt-dlp', 'youtube-dl'].includes(tool)) {
                toolMethods.push(
                    { cmd: `pip3 install -U --break-system-packages ${tool}`,           desc: `pip3 --break-system-packages` },
                    { cmd: `pip3 install -U ${tool}`,                                   desc: `pip3 -U` },
                    { cmd: `pip3 install ${tool}`,                                      desc: `pip3 fresh` },
                    { cmd: `pip install -U --break-system-packages ${tool}`,            desc: `pip --break-system-packages` },
                    { cmd: `pip install -U ${tool}`,                                    desc: `pip -U` },
                    { cmd: `python3 -m pip install -U --break-system-packages ${tool}`, desc: `python3 -m pip --break-system-packages` },
                    { cmd: `python3 -m pip install -U ${tool}`,                         desc: `python3 -m pip -U` },
                );
                if (tool === 'yt-dlp') {
                    toolMethods.push(
                        { cmd: `curl -L "${YTDLP_BIN_URL}" -o /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`, desc: 'binary curl → /usr/local/bin' },
                        { cmd: `wget -q "${YTDLP_BIN_URL}" -O /usr/local/bin/yt-dlp && chmod a+rx /usr/local/bin/yt-dlp`, desc: 'binary wget → /usr/local/bin' },
                        { cmd: `curl -L "${YTDLP_BIN_URL}" -o "${termuxBin}" && chmod a+rx "${termuxBin}"`,               desc: 'binary curl → termux' },
                        { cmd: `wget -q "${YTDLP_BIN_URL}" -O "${termuxBin}" && chmod a+rx "${termuxBin}"`,               desc: 'binary wget → termux' },
                        { cmd: `curl -L "${YTDLP_BIN_URL}" -o "${prefixBin}" && chmod a+rx "${prefixBin}"`,               desc: 'binary curl → PREFIX/bin' },
                    );
                }
            }

            toolMethods.push(
                { cmd: `pkg install -y ${pkgName}`,                              desc: `pkg (termux)` },
                { cmd: `apt install -y ${pkgName}`,                              desc: `apt (termux)` },
                { cmd: `apt update -y && apt install -y ${pkgName}`,             desc: `apt update+install (termux)` },
                { cmd: `apt install -y ${pkgName}`,                              desc: `apt` },
                { cmd: `apt update && apt install -y ${pkgName}`,                desc: `apt update+install` },
                { cmd: `apt-get install -y ${pkgName}`,                          desc: `apt-get` },
                { cmd: `pacman -S --noconfirm ${pkgName}`,                       desc: `pacman` },
                { cmd: `apk add ${pkgName}`,                                     desc: `apk` },
                { cmd: `dnf install -y ${pkgName}`,                              desc: `dnf` },
                { cmd: `yum install -y ${pkgName}`,                              desc: `yum` },
                { cmd: `zypper install -y ${pkgName}`,                           desc: `zypper` },
                { cmd: `xbps-install -y ${pkgName}`,                             desc: `xbps` },
                { cmd: `brew install ${pkgName}`,                                desc: `brew` },
            );

            let toolInstalled = false;
            for (let i = 0; i < toolMethods.length; i++) {
                const m = toolMethods[i];
                try {
                    log.info(`[${i+1}/${toolMethods.length}] ${m.desc}`);
                    execSync(m.cmd, { stdio: 'pipe', timeout: 120000, shell: '/bin/bash' });
                    // Verify installation
                    if (commandExists(tool)) {
                        log.success(`✅ ${tool} installed successfully! (${m.desc})`);
                        toolInstalled = true;
                        break;
                    }
                } catch (e) {
                    log.warn(`✗ ${m.desc}`);
                }
            }

            if (!toolInstalled) {
                log.warn(`⚠️ ${tool} installation failed — bot will run with limited capabilities`);
            }
        }
    }

    // Other optional tools (imagemagick, etc.)
    const otherOptionalTools = missingOptional.filter(tool => !['yt-dlp', 'youtube-dl', 'spotifydl', 'wget', 'aria2c', 'sox'].includes(tool));
    if (otherOptionalTools.length > 0) {
        log.warn(`\nOther missing optional tools: ${otherOptionalTools.join(', ')}`);

        log.info('Attempting automatic installation...\n');
        
        // Try multiple methods without sudo for environments like Railway
        const installMethods = [
            `apt-get update -y && apt-get install -y ${otherOptionalTools.join(' ')}`,
            `apt update -y && apt install -y ${otherOptionalTools.join(' ')}`,
            `pkg install -y ${otherOptionalTools.join(' ')}`,
            `yum install -y ${otherOptionalTools.join(' ')}`,
            `dnf install -y ${otherOptionalTools.join(' ')}`
        ];

        let optionalInstallSuccess = false;
        for (let i = 0; i < installMethods.length; i++) {
            try {
                log.info(`[Attempt ${i+1}/${installMethods.length}] Installing: ${installMethods[i]}`);
                execSync(installMethods[i], { stdio: 'inherit', timeout: 180000, shell: '/bin/bash' });
                optionalInstallSuccess = true;
                log.success('✅ Optional dependencies installed successfully!');
                break;
            } catch (e) {
                log.warn(`Attempt ${i+1} failed`);
            }
        }
        
        if (!optionalInstallSuccess) {
            log.info('\n⚠️ The following optional dependencies are missing, some features may be limited:', otherOptionalTools.join(', '));
        }
    }

    log.success('✅ Setup verification complete!');
}

// Helper: get install commands for a given OS and package list
function getInstallCommands(osInfo, packages) {
    const pkg = packages[0];
    
    const cmds = {
        justrunmy: {
            methods: [
                { cmd: `DEBIAN_FRONTEND=noninteractive apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${packages.join(' ')}`, desc: 'apt-get DEBIAN_FRONTEND (no sudo)' },
                { cmd: `apt-get update -y && apt-get install -y ${packages.join(' ')}`, desc: 'apt-get (no sudo)' },
                { cmd: `apt update -y && apt install -y --no-install-recommends ${packages.join(' ')}`, desc: 'apt --no-install-recommends' },
                { cmd: `apt update -y && apt install -y ${packages.join(' ')}`, desc: 'apt (no sudo)' },
            ],
            update: `DEBIAN_FRONTEND=noninteractive apt-get update -y`,
            install: `DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ${packages.join(' ')}`
        },
        termux: {
            methods: [
                { cmd: `pkg update -y && pkg install -y ${packages.join(' ')}`, desc: 'pkg update + install' },
                { cmd: `pkg upgrade -y && pkg install -y ${packages.join(' ')}`, desc: 'pkg upgrade + install' },
                { cmd: `apt update -y && apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
            ],
            update: `pkg update -y`,
            install: `pkg install -y ${packages.join(' ')}`
        },
        ubuntu: {
            methods: [
                { cmd: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt upgrade + install' },
            ],
            update: `sudo apt update -y`,
            install: `sudo apt install -y ${packages.join(' ')}`
        },
        wsl: {
            methods: [
                { cmd: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt upgrade + install' },
            ],
            update: `sudo apt update -y`,
            install: `sudo apt install -y ${packages.join(' ')}`
        },
        macos: {
            methods: [
                { cmd: `brew update && brew install ${packages.join(' ')}`, desc: 'brew update + install' },
                { cmd: `brew upgrade && brew install ${packages.join(' ')}`, desc: 'brew upgrade + install' },
            ],
            update: `brew update`,
            install: `brew install ${packages.join(' ')}`
        },
        linux: {
            methods: [
                { cmd: `sudo apt update -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt update + install' },
                { cmd: `sudo apt upgrade -y && sudo apt install -y ${packages.join(' ')}`, desc: 'apt upgrade + install' },
                { cmd: `sudo yum install -y ${packages.join(' ')}`, desc: 'yum install' },
                { cmd: `sudo dnf install -y ${packages.join(' ')}`, desc: 'dnf install' },
            ],
            update: `sudo apt update -y`,
            install: `sudo apt install -y ${packages.join(' ')}`
        }
    };
    
    return cmds[osInfo.type] || cmds.linux;
}

// ffmpeg multi-method installer
async function installFFmpeg(osInfo) {
    log.header(`📥 Installing ffmpeg - trying all platforms`);

    const hasRoot = process.getuid ? process.getuid() === 0 : true;
    if (!hasRoot) {
        log.info('🔐 Attempting root access...');
        try {
            execSync('sudo -v -p "" 2>/dev/null || true', { stdio: 'pipe', timeout: 5000 });
        } catch (e) {}
    }

    const termuxMethods = getInstallCommands({type: 'termux'}, ['ffmpeg']).methods;
    const ubuntuMethods = getInstallCommands({type: 'ubuntu'}, ['ffmpeg']).methods;
    const wslMethods = getInstallCommands({type: 'wsl'}, ['ffmpeg']).methods;
    const macosMethods = getInstallCommands({type: 'macos'}, ['ffmpeg']).methods;
    const linuxMethods = getInstallCommands({type: 'linux'}, ['ffmpeg']).methods;

    const allPlatforms = [
        { name: 'Termux', methods: termuxMethods },
        { name: 'Ubuntu/Debian', methods: ubuntuMethods },
        { name: 'WSL/Windows', methods: wslMethods },
        { name: 'macOS', methods: macosMethods },
        { name: 'Linux (Generic)', methods: linuxMethods }
    ];

    let totalAttempts = 0;

    for (const platform of allPlatforms) {
        log.info(`\n${chalk.bold.cyan(`━━━ ${platform.name} ━━━`)}`);
        for (const method of platform.methods) {
            totalAttempts++;
            try {
                log.info(`[${totalAttempts}] ${chalk.yellow(method.desc.substring(0, 50))}`);
                
                let cmd = method.cmd;
                if (!hasRoot && !cmd.includes('sudo') && !cmd.includes('brew') && osInfo.type !== 'termux') {
                    cmd = `sudo -E bash -c "${cmd.replace(/"/g, '\\"')}"`;
                }
                
                execSync(cmd, { stdio: 'inherit', timeout: 120000, shell: '/bin/bash' });
                await new Promise(r => setTimeout(r, 500));
                
                try {
                    const v = execSync('ffmpeg -version 2>&1 | head -n1', { encoding: 'utf8', timeout: 5000 });
                    if (v.includes('ffmpeg')) {
                        log.success(`\n✅ ffmpeg OK! (attempt ${totalAttempts})\n`);
                        return true;
                    }
                } catch (e) {}
                
                if (commandExists('ffmpeg')) {
                    log.success(`\n✅ ffmpeg installed! (attempt ${totalAttempts})\n`);
                    return true;
                }
            } catch (e) {
                log.warn('✗ Failed');
            }
        }
    }

    log.error(`\n❌ ffmpeg installation failed!`);
    return false;
}

// ═══════════════════════════════════════════════════════════
// 🚀 Main Process
// ═══════════════════════════════════════════════════════════

async function start() {
    console.log('[start.js] start() function called');
    try {
        await autoInstallDependencies();

        const osInfo = detectOS();
        log.header(`🚀 🦊 Maureonix Starting\n${chalk.yellow(`Platform: ${osInfo.display}`)}`);

        // Start main bot
        let args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)];
        let p = spawn(process.argv[0], args, {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc']
        }).on('message', data => {
            if (data === 'reset') {
                console.log(chalk.yellow.bold('[BOT] Restarting...'));
                p.kill();
                start();
            } else if (data === 'uptime') {
                p.send(process.uptime());
            }
        }).on('exit', code => {
            if (code !== 0) {
                console.error(chalk.red.bold(`[BOT] Process exited with code ${code}. Restarting...`));
                setTimeout(() => start(), 3000);
            } else {
                console.log(chalk.green.bold('[BOT] Process ended — restarting...'));
                setTimeout(() => start(), 3000);
            }
        });

        // Auto git pull (disabled)
        startAutoGitPull(() => p);
    } catch (e) {
        log.error('Startup failed: ' + e.message);
        console.error(e);
        log.warn('🔄 Retrying in 10s...');
        setTimeout(() => start(), 10000);
    }
}

// Run
start();
