/* eslint no-console: 0 */
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { gray, red, greenBright, dim } from 'yoctocolors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const EXAMPLES_BASELINE_DIR = path.join(__dirname, '..', 'static', 'examples');
const VR_ROOT_DIR = path.join(__dirname, '..', 'static', '__vr');
const VR_LATEST_DIR = path.join(VR_ROOT_DIR, 'latest');
const VR_DIFF_DIR = path.join(VR_ROOT_DIR, 'diff');
const REPORT_PATH = path.join(VR_ROOT_DIR, 'report.json');
const SCREENSHOT_WIDTH = 600;
const DEVICE_PIXEL_RATIO = 2;

// percentage of pixels allowed to differ (0.01 = 1%)
const DIFF_THRESHOLD = parseFloat(process.env.VR_DIFF_THRESHOLD || '0.01');

// Start the development server and return server instance and local URL
const startServer = () => {
    console.log(dim('Starting development server...'));
    const server = exec('pnpm dev');

    return new Promise((resolve) => {
        let serverUrl = null;

        server.stdout.on('data', (data) => {
            const text = data.toString();
            // process.stdout.write(`Server: ${text}`);
            const localUrlMatch = text.match(/Local:\s+(http:\/\/localhost:\d+\/)/i);
            if (localUrlMatch && localUrlMatch[1]) {
                serverUrl = localUrlMatch[1].trim();
                console.log(`${greenBright(' ✓ ')}${dim(`Detected server URL: ${serverUrl}`)}`);
            }
            if ((text.includes('Local:') || text.includes('Server running at')) && serverUrl) {
                console.log(`${greenBright(' ✓ ')}${dim('Server started successfully')}`);
                resolve({ server, url: serverUrl });
            }
        });

        server.stderr.on('data', (data) => {
            process.stderr.write(`Server error: ${data}`);
        });
    });
};

const ensureDirectoryExists = async (dirPath) => {
    await fs.mkdir(dirPath, { recursive: true }).catch((err) => {
        if (err && err.code !== 'EEXIST') throw err;
    });
};

const listPngs = async (dir) => {
    const out = [];
    const walk = async (d) => {
        const entries = await fs.readdir(d, { withFileTypes: true });
        for (const e of entries) {
            const fp = path.join(d, e.name);
            if (e.isDirectory()) await walk(fp);
            else if (e.isFile() && fp.endsWith('.png')) out.push(fp);
        }
    };
    await walk(dir);
    return out;
};

// Build unique url paths from baseline screenshots (ignore .dark suffix)
const uniqueExamplePaths = async () => {
    const files = await listPngs(EXAMPLES_BASELINE_DIR);
    const set = new Set();
    for (const f of files) {
        const rel = path.relative(EXAMPLES_BASELINE_DIR, f);
        const noDark = rel.replace(/\.dark\.png$/, '.png');
        const withoutExt = noDark.replace(/\.png$/, '');
        set.add(withoutExt);
    }
    return Array.from(set).sort();
};

// Wait for and clip to the screenshot element on a page
const takeScreenshot = async (page, urlPath, outputPath, isDarkMode = false) => {
    const themeSuffix = isDarkMode ? '.dark' : '';
    const finalOutputPath = outputPath.replace('.png', `${themeSuffix}.png`);

    await page.waitForSelector('.content figure.svelteplot ', { timeout: 10000 });

    if (isDarkMode) {
        await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            window.dispatchEvent(new Event('theme-change'));
        });
        await new Promise((r) => setTimeout(r, 300));
    }

    const elementHandle = await page.evaluateHandle(() =>
        document.querySelector('.content .screenshot')
    );
    const box = await elementHandle.boundingBox();
    if (!box) {
        console.error(`No bounding box for ${urlPath} (${isDarkMode ? 'dark' : 'light'})`);
        return false;
    }
    await page.screenshot({
        path: finalOutputPath,
        clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    return true;
};

// Compare two images by URL within the browser using Canvas, return diff and dataURL
const compareImages = async (page, baselineUrl, latestUrl, diffOutPath, serverUrl) => {
    // Ensure the page has the same origin as the images to avoid canvas taint
    try {
        await page.goto(serverUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch {}
    const result = await page.evaluate(
        async (bUrl, lUrl) => {
            const loadImage = (src) =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });

            const baseline = await loadImage(bUrl);
            const latest = await loadImage(lUrl);

            const w = Math.min(baseline.naturalWidth, latest.naturalWidth);
            const h = Math.min(baseline.naturalHeight, latest.naturalHeight);

            // If sizes differ, we still compare the overlap; mark size mismatch
            const sizeMismatch =
                baseline.naturalWidth !== latest.naturalWidth ||
                baseline.naturalHeight !== latest.naturalHeight;

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(baseline, 0, 0);
            const a = ctx.getImageData(0, 0, w, h);
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(latest, 0, 0);
            const b = ctx.getImageData(0, 0, w, h);

            const diff = ctx.createImageData(w, h);
            let mismatched = 0;
            const perChannelThreshold = 5; // tolerate minor AA

            for (let i = 0; i < a.data.length; i += 4) {
                const dr = Math.abs(a.data[i] - b.data[i]);
                const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
                const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
                const da = Math.abs(a.data[i + 3] - b.data[i + 3]);
                const isDifferent =
                    dr > perChannelThreshold ||
                    dg > perChannelThreshold ||
                    db > perChannelThreshold ||
                    da > perChannelThreshold;
                if (isDifferent) {
                    mismatched++;
                    // highlight diff in red
                    diff.data[i] = 255;
                    diff.data[i + 1] = 0;
                    diff.data[i + 2] = 0;
                    diff.data[i + 3] = 255;
                } else {
                    // copy latest pixel faintly for context
                    diff.data[i] = b.data[i] * 0.3;
                    diff.data[i + 1] = b.data[i + 1] * 0.3;
                    diff.data[i + 2] = b.data[i + 2] * 0.3;
                    diff.data[i + 3] = 255;
                }
            }
            ctx.putImageData(diff, 0, 0);
            const diffDataUrl = canvas.toDataURL('image/png');
            const total = a.data.length / 4;
            const percentage = total ? mismatched / total : 0;
            return { width: w, height: h, mismatched, percentage, diffDataUrl, sizeMismatch };
        },
        baselineUrl,
        latestUrl
    );

    // Write diff image to disk
    if (result && result.diffDataUrl) {
        const base64 = result.diffDataUrl.replace(/^data:image\/png;base64,/, '');
        await ensureDirectoryExists(path.dirname(diffOutPath));
        await fs.writeFile(diffOutPath, Buffer.from(base64, 'base64'));
    }
    return result;
};

const main = async () => {
    await ensureDirectoryExists(VR_LATEST_DIR);
    await ensureDirectoryExists(VR_DIFF_DIR);

    const { server, url: serverUrl } = await startServer();

    const failures = [];
    const records = [];

    try {
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: SCREENSHOT_WIDTH,
                height: 800,
                deviceScaleFactor: DEVICE_PIXEL_RATIO
            },
            headless: 'new'
        });

        const examplePaths = await uniqueExamplePaths();
        process.stdout.write(
            greenBright(' ✓ ') + dim(`Found ${examplePaths.length} baseline example(s)\n\n`)
        );

        // ANSI colors for status
        const GREEN = '\x1b[32m';
        const RED = '\x1b[31m';
        const RESET = '\x1b[0m';

        for (const urlPath of examplePaths) {
            const route = `examples/${urlPath}`;
            const latestBase = path.join(VR_LATEST_DIR, urlPath + '.png');
            const latestDir = path.dirname(latestBase);
            await ensureDirectoryExists(latestDir);

            // Print progress line and append result when done
            process.stdout.write(
                `${dim(' - processing ')}${route.split('/').slice(1).join('/')}  `
            );

            let routeFailed = false;

            const page = await browser.newPage();
            await page.goto(`${serverUrl}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });

            // light
            await takeScreenshot(page, urlPath, latestBase, false);
            // dark
            await takeScreenshot(page, urlPath, latestBase, true);
            await page.close();

            // Compare light
            for (const mode of ['light', 'dark']) {
                const suffix = mode === 'dark' ? '.dark' : '';
                const baselinePng = path.join(EXAMPLES_BASELINE_DIR, urlPath + `${suffix}.png`);
                const latestPng = path.join(VR_LATEST_DIR, urlPath + `${suffix}.png`);
                const diffPng = path.join(VR_DIFF_DIR, urlPath + `${suffix}.png`);

                // Ensure baseline exists; if not, skip compare
                let baselineExists = false;
                try {
                    await fs.access(baselinePng);
                    baselineExists = true;
                } catch {}
                if (!baselineExists) {
                    const rec = {
                        route,
                        mode,
                        status: 'missing-baseline',
                        baseline: baselinePng,
                        latest: latestPng
                    };
                    records.push(rec);
                    failures.push(rec);
                    console.warn(`Missing baseline: ${baselinePng}`);
                    routeFailed = true;
                    continue;
                }

                const comparePage = await browser.newPage();
                const baselineUrl = `${serverUrl}${path.posix.join('examples', urlPath + `${suffix}.png`)}`;
                const latestUrl = `${serverUrl}${path.posix.join('__vr', 'latest', urlPath + `${suffix}.png`)}`;
                let res;
                try {
                    res = await compareImages(
                        comparePage,
                        baselineUrl,
                        latestUrl,
                        diffPng,
                        serverUrl
                    );
                } catch (e) {
                    res = {
                        width: 0,
                        height: 0,
                        mismatched: 0,
                        percentage: 1,
                        sizeMismatch: false,
                        error: String(e)
                    };
                } finally {
                    await comparePage.close();
                }

                const passed = !res.sizeMismatch && res.percentage <= DIFF_THRESHOLD;
                const rec = {
                    route,
                    mode,
                    width: res.width,
                    height: res.height,
                    mismatched: res.mismatched,
                    percentage: res.percentage,
                    threshold: DIFF_THRESHOLD,
                    sizeMismatch: res.sizeMismatch,
                    baseline: baselinePng,
                    latest: latestPng,
                    diff: diffPng,
                    status: passed ? 'passed' : 'failed'
                };
                records.push(rec);
                if (!passed) {
                    failures.push(rec);
                    routeFailed = true;
                }
            }

            // Append final status to the same line
            const okText = greenBright(`[OK]`);
            const failText = red(`[FAILED]`);
            process.stdout.write(`${routeFailed ? failText : okText}\n`);
        }

        await browser.close();
    } catch (err) {
        console.error('Error during visual regression:', err);
        // If a catastrophic error occurs, treat as failure
        failures.push({ route: '(fatal)', mode: '-', error: String(err) });
    } finally {
        // Always stop the server
        server.kill();
    }

    // Write JSON report
    await ensureDirectoryExists(VR_ROOT_DIR);
    await fs.writeFile(
        REPORT_PATH,
        JSON.stringify(
            {
                threshold: DIFF_THRESHOLD,
                total: records.length,
                failed: failures.length,
                failures,
                records
            },
            null,
            2
        )
    );

    // Console report
    console.log('\nVisual Regression Report');
    console.log('Threshold:', DIFF_THRESHOLD);
    for (const r of records) {
        const pct = r.percentage !== undefined ? (r.percentage * 100).toFixed(3) + '%' : '-';
        const marker = r.status === 'passed' ? '✓' : r.status === 'failed' ? '✗' : '!';
        console.log(
            `${marker} ${String(r.mode || '-').padEnd(5)} ${r.route} diff=${pct}${r.sizeMismatch ? ' (size mismatch)' : ''}`
        );
    }
    const passedCount = records.filter((r) => r.status === 'passed').length;
    const failedCount = records.filter((r) => r.status !== 'passed').length;
    console.log(`\n${passedCount} passed, ${failedCount} failed`);

    if (failures.length > 0) {
        process.exitCode = 1;
    }
    server.kill();
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
