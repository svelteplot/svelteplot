/* eslint no-console: 0 */
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { exec } from 'child_process';
import logUpdate from 'log-update';
import { gray, red, greenBright, dim } from 'yoctocolors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const EXAMPLES_BASELINE_DIR = path.join(__dirname, '..', 'src', 'snapshots');
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
    const server = exec('pnpm preview');

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
    return Array.from(set).sort((a, b) => a.localeCompare(b));
};

// Wait for and clip to the screenshot element on a page
const takeScreenshot = async (page, urlPath, outputPath, isDarkMode = false) => {
    const themeSuffix = isDarkMode ? '.dark' : '';
    const finalOutputPath = outputPath.replace('.png', `${themeSuffix}.png`);

    await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: isDarkMode ? 'dark' : 'light' }
    ]);

    await page.waitForSelector('.content figure.svelteplot ', { timeout: 10000 });

    if (isDarkMode) {
        await page.evaluate(() => {
            document.documentElement.classList.add('dark');
        });
        await new Promise((r) => setTimeout(r, 300));
    } else {
        await page.evaluate(() => {
            document.documentElement.classList.remove('dark');
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

// Compare two images via pixelmatch in Node (faster than round-tripping through the browser)
const compareImages = async (baselinePath, latestPath, diffOutPath) => {
    const [baselineBuffer, latestBuffer] = await Promise.all([
        fs.readFile(baselinePath),
        fs.readFile(latestPath)
    ]);

    const baseline = PNG.sync.read(baselineBuffer);
    const latest = PNG.sync.read(latestBuffer);

    const width = Math.min(baseline.width, latest.width);
    const height = Math.min(baseline.height, latest.height);
    const sizeMismatch = baseline.width !== latest.width || baseline.height !== latest.height;

    const cropTo = (img) => {
        if (img.width === width && img.height === height) return img;
        const out = new PNG({ width, height });
        for (let y = 0; y < height; y++) {
            const srcStart = y * img.width * 4;
            const destStart = y * width * 4;
            img.data.copy(out.data, destStart, srcStart, srcStart + width * 4);
        }
        return out;
    };

    const a = cropTo(baseline);
    const b = cropTo(latest);
    const diff = new PNG({ width, height });
    const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
        threshold: 0.1,
        includeAA: false
    });

    await ensureDirectoryExists(path.dirname(diffOutPath));
    await fs.writeFile(diffOutPath, PNG.sync.write(diff));

    const total = width * height;
    const percentage = total ? mismatched / total : 0;
    return { width, height, mismatched, percentage, sizeMismatch };
};

// Limit concurrent promises to avoid overloading the dev server
const createLimiter = (limit) => {
    let active = 0;
    const queue = [];

    const next = () => {
        if (active >= limit) return;
        const item = queue.shift();
        if (!item) return;
        active++;
        item.fn()
            .then((res) => item.resolve(res))
            .catch((err) => item.reject(err))
            .finally(() => {
                active--;
                next();
            });
    };

    return (fn) =>
        new Promise((resolve, reject) => {
            queue.push({ fn, resolve, reject });
            next();
        });
};

const main = async () => {
    // empty out previous latest and diff images
    await fs.rm(VR_LATEST_DIR, { recursive: true, force: true });
    await fs.rm(VR_DIFF_DIR, { recursive: true, force: true });

    await ensureDirectoryExists(VR_LATEST_DIR);
    await ensureDirectoryExists(VR_DIFF_DIR);

    const { server, url: serverUrl } = await startServer();

    const completed = [];
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

        const okText = greenBright(`[OK]`);
        const failText = red(`[FAILED]`);
        const concurrency = Math.max(1, parseInt(process.env.VR_CONCURRENCY || '4', 10));
        const limit = createLimiter(concurrency);
        const running = new Set();

        let frame = 0;
        const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

        let jobStarted = new Map();

        const renderRunning = () => {
            for (const r of running) {
                if (!jobStarted.has(r)) {
                    jobStarted.set(r, Date.now());
                }
            }
            frame++;
            logUpdate(`
Completed:
${completed.length > 20 ? gray(`... and ${completed.length - 20} more\n`) : ''}${completed
                .slice(-20)
                .map((x) => `${gray(`- ${x.shortRoute} ${x.mode} `)}${okText}`)
                .join('\n')}

Failed:
${failures.map((x) => `${gray(`- ${x.shortRoute} ${x.mode} `)}${failText}`).join('\n')}

Running:
${[...running].map((r) => `${gray(`- `)}${r} ${spinner[frame % spinner.length]} ${gray(((Date.now() - jobStarted.get(r)) / 1000).toFixed(1) + 's')}`).join('\n')}
`);
        };
        let i = setInterval(renderRunning, 80);

        const runExample = async (urlPath) => {
            const route = `examples/${urlPath}`;
            const latestBase = path.join(VR_LATEST_DIR, urlPath + '.png');
            const latestDir = path.dirname(latestBase);
            await ensureDirectoryExists(latestDir);

            const shortRoute = route.split('/').slice(1).join('/');
            running.add(shortRoute);
            renderRunning();

            let page;

            try {
                try {
                    page = await browser.newPage();
                    await page.goto(`${serverUrl}${route}`, {
                        waitUntil: 'networkidle0',
                        timeout: 60000
                    });

                    // light
                    await takeScreenshot(page, urlPath, latestBase, false);
                    // dark
                    await takeScreenshot(page, urlPath, latestBase, true);
                } catch (err) {
                    const rec = {
                        route,
                        shortRoute,
                        mode: '-',
                        status: 'error',
                        error: String(err)
                    };
                    records.push(rec);
                    failures.push(rec);
                    running.delete(shortRoute);
                    renderRunning();
                    // console.log(`- completed ${shortRoute}  ${failText}`);
                    return;
                } finally {
                    if (page) await page.close().catch(() => {});
                }

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
                            shortRoute,
                            mode,
                            status: 'missing-baseline',
                            baseline: baselinePng,
                            latest: latestPng
                        };
                        records.push(rec);
                        failures.push(rec);
                        console.warn(`Missing baseline: ${baselinePng}`);
                        continue;
                    }

                    let res;

                    try {
                        res = await compareImages(baselinePng, latestPng, diffPng);
                    } catch (e) {
                        console.log(e);
                        res = {
                            shortRoute,
                            width: 0,
                            height: 0,
                            mismatched: 0,
                            percentage: 1,
                            sizeMismatch: false,
                            error: String(e)
                        };
                    }

                    const passed = !res.sizeMismatch && res.percentage <= DIFF_THRESHOLD;
                    const rec = {
                        route,
                        shortRoute,
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
                    } else {
                        completed.push(rec);
                    }
                }

                // Append final status to the same line
                running.delete(shortRoute);
                // renderRunning();
                // console.log(`- completed ${shortRoute}  ${statusText}`);
            } catch (err) {
                const rec = {
                    route,
                    mode: '-',
                    status: 'error',
                    error: String(err)
                };
                records.push(rec);
                failures.push(rec);
                running.delete(shortRoute);
                // renderRunning();
                // console.log(`- completed ${shortRoute}  ${failText}`);
            }
        };

        await Promise.all(examplePaths.map((urlPath) => limit(() => runExample(urlPath))));

        clearInterval(i);

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
        if (r.status !== 'passed') {
            console.log(
                `${marker} ${String(r.mode || '-').padEnd(5)} ${r.route} diff=${pct}${r.sizeMismatch ? ' (size mismatch)' : ''}`
            );
        }
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
