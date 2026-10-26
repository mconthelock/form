const fs = require('fs');
const os = require('os');
const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

function resolveCachedChromiumExecutable() {
    const cacheDir = path.join(os.homedir(), 'Library/Caches/ms-playwright');
    if (!fs.existsSync(cacheDir)) return undefined;

    const dirs = fs
        .readdirSync(cacheDir)
        .filter((d) => d.startsWith('chromium_headless_shell-'))
        .sort()
        .reverse();

    for (const dir of dirs) {
        const candidate = path.join(
            cacheDir,
            dir,
            'chrome-headless-shell-mac-arm64/chrome-headless-shell',
        );
        if (fs.existsSync(candidate)) return candidate;
    }
    return undefined;
}

const executablePath = resolveCachedChromiumExecutable();

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'list',
    use: {
        baseURL: process.env.APP_ENV || 'http://localhost:8080/form',
        trace: 'on-first-retry',
        launchOptions: executablePath ? { executablePath } : {},
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});

