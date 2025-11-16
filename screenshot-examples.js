import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const EXAMPLES_DIR = path.join(__dirname, 'src', 'routes', 'examples');
const OUTPUT_DIR = path.join(__dirname, 'static', 'examples');
const SCREENSHOT_WIDTH = 600;
const DEVICE_PIXEL_RATIO = 2;

// Only take missing screenshots if ENV variable is set
const ONLY_MISSING = process.env.ONLY_MISSING == 1;

// Start the development server and return server instance and local URL
const startServer = () => {
    console.log('Starting development server...');
    const server = exec('pnpm dev');

    // Wait for the server to start and extract the local URL
    return new Promise((resolve) => {
        let serverUrl = null;

        server.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);

            // Extract the local URL using regex
            const localUrlMatch = data.toString().match(/Local:\s+(http:\/\/localhost:\d+\/)/i);
            if (localUrlMatch && localUrlMatch[1]) {
                serverUrl = localUrlMatch[1].trim();
                console.log(`Detected server URL: ${serverUrl}`);
            }

            // Server is ready when we see this message and have a URL
            if ((data.includes('Local:') || data.includes('Server running at')) && serverUrl) {
                console.log('Server started successfully');
                resolve({ server, url: serverUrl });
            }
        });

        server.stderr.on('data', (data) => {
            console.error(`Server error: ${data}`);
        });
    });
};

// Recursively get all Svelte files (excluding layout, _index, [...key] files)
const getSvelteFiles = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory() && !entry.name.startsWith('[')) {
                return getSvelteFiles(fullPath);
            } else if (
                entry.isFile() &&
                entry.name.endsWith('.svelte') &&
                !entry.name.startsWith('+') &&
                !entry.name.startsWith('_')
            ) {
                return [fullPath];
            }

            return [];
        })
    );

    return files.flat();
};

const getExistingScreenshots = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                return getExistingScreenshots(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.png')) {
                return [fullPath];
            }

            return [];
        })
    );

    return files.flat();
};

// Convert file path to URL path
const filePathToUrlPath = (filePath) => {
    const relativePath = path.relative(EXAMPLES_DIR, filePath);
    return relativePath.replace('.svelte', '');
};

// Create output directory if it doesn't exist
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        // Ignore if directory already exists
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
};

// Take screenshot of a page in specific theme
const takeScreenshot = async (page, urlPath, outputPath, isDarkMode = false) => {
    const themeSuffix = isDarkMode ? '.dark' : '';
    const finalOutputPath = outputPath.replace('.png', `${themeSuffix}.png`);

    // Wait for the Plot component to be rendered
    await page.waitForSelector('.content figure.svelteplot ', {
        timeout: 10000
    });

    // Toggle dark mode if needed
    if (isDarkMode) {
        // Toggle dark mode by setting the HTML class
        // SveltePress uses 'html.dark' for dark mode
        await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            // Force any theme-aware components to re-render
            window.dispatchEvent(new Event('theme-change'));
        });

        // Wait a bit for theme to apply
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Get the Plot SVG element
    const elementHandle = await page.evaluateHandle(() =>
        document.querySelector('.content .screenshot')
    );

    // Take a screenshot of the element
    const boundingBox = await elementHandle.boundingBox();

    if (!boundingBox) {
        console.error(
            `Could not get bounding box for example: ${urlPath} (${isDarkMode ? 'dark' : 'light'} mode)`
        );
        return false;
    }

    // Take the screenshot
    await page.screenshot({
        path: finalOutputPath,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height
        }
    });

    console.log(`Saved screenshot to: ${finalOutputPath}`);
    return true;
};

// Take screenshots of all example pages
const screenshotExamples = async () => {
    // Start the server and get the URL
    const { server, url: serverUrl } = await startServer();

    try {
        // Launch the browser
        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            defaultViewport: {
                width: SCREENSHOT_WIDTH,
                height: 800,
                deviceScaleFactor: DEVICE_PIXEL_RATIO
            },
            // Launch Chrome in headless mode
            headless: 'new'
        });

        // Get all example Svelte files
        let svelteFiles = await getSvelteFiles(EXAMPLES_DIR);
        console.log(`Found ${svelteFiles.length} example files to screenshot`);

        if (ONLY_MISSING) {
            // Filter to only include files that don't have screenshots ()
            const existingScreenshots = (await getExistingScreenshots(OUTPUT_DIR)).map((file) =>
                path.relative(OUTPUT_DIR, file)
            );

            console.log(`Found ${existingScreenshots.length} existing screenshots`);

            // Filter out files that already have screenshots
            svelteFiles = svelteFiles.filter((filePath) => {
                return (
                    !existingScreenshots.find((screenshot) =>
                        filePath.endsWith(screenshot.replace('.png', '.svelte'))
                    ) ||
                    !existingScreenshots.find((screenshot) =>
                        filePath.endsWith(screenshot.replace('.dark.png', '.svelte'))
                    )
                );
            });

            console.log(
                `Filtered down to ${svelteFiles.length} files needing screenshots`,
                svelteFiles
            );
        }

        // Process each file
        for (const filePath of svelteFiles) {
            const urlPath = filePathToUrlPath(filePath);
            const outputPath = path.join(OUTPUT_DIR, urlPath + '.png');
            const outputDir = path.dirname(outputPath);

            console.log(`Processing: ${urlPath}`);

            // Create output directory structure
            await ensureDirectoryExists(outputDir);

            // Open the page
            const page = await browser.newPage();
            await page.goto(`${serverUrl}examples/${urlPath}`, {
                waitUntil: 'networkidle0',
                timeout: 60000
            });

            // Take light mode screenshot
            await takeScreenshot(page, urlPath, outputPath, false);

            // Take dark mode screenshot
            await takeScreenshot(page, urlPath, outputPath, true);

            await page.close();
        }

        // Close the browser
        await browser.close();

        console.log('All screenshots completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Kill the server
        server.kill();
        process.exit(0);
    }
};

// Run the script
screenshotExamples().catch(console.error);
