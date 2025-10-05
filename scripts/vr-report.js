import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VR_ROOT_DIR = path.join(__dirname, '..', 'static', '__vr');
const REPORT_JSON = path.join(VR_ROOT_DIR, 'report.json');
const REPORT_HTML = path.join(VR_ROOT_DIR, 'report.html');

const ensureDir = async (p) => {
    await fs.mkdir(p, { recursive: true }).catch((err) => {
        if (err && err.code !== 'EEXIST') throw err;
    });
};

const escapeHtml = (s) =>
    String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

async function generate() {
    // Load JSON report
    let json;
    try {
        const raw = await fs.readFile(REPORT_JSON, 'utf8');
        json = JSON.parse(raw);
    } catch (e) {
        console.error(`Could not read ${REPORT_JSON}. Run visual tests first.`);
        process.exit(1);
    }

    const records = Array.isArray(json.records) ? json.records.slice() : [];
    const threshold = json.threshold ?? 0;

    // Sort: failed/missing first, then passed; then route, then mode
    records.sort((a, b) => {
        const aFail = a.status === 'passed' ? 1 : 0;
        const bFail = b.status === 'passed' ? 1 : 0;
        if (aFail !== bFail) return aFail - bFail; // 0 (fail) before 1 (pass)
        const rc = String(a.route).localeCompare(String(b.route));
        if (rc) return rc;
        return String(a.mode).localeCompare(String(b.mode));
    });

    const head = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visual Regression Report</title>
  <style>
    :root { --ok: #2e7d32; --fail: #c62828; --muted: #666; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 24px; }
    header { margin-bottom: 16px; }
    header h1 { margin: 0 0 8px; font-size: 20px; }
    header .meta { color: var(--muted); font-size: 14px; }
    .case { border: 1px solid #ddd; border-left-width: 6px; padding: 12px; margin: 16px 0; border-radius: 6px; }
    .case.passed { border-left-color: var(--ok); }
    .case.failed, .case[ data-status="missing-baseline" ] { border-left-color: var(--fail); }
    .title { display:flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
    .title .route { font-weight: 600; }
    .title .mode { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
    .title .status { font-weight: 700; }
    .status.ok { color: var(--ok); }
    .status.fail { color: var(--fail); }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    figure { margin: 0; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #fafafa; }
    figure img { display: block; width: 100%; height: auto; image-rendering: -webkit-optimize-contrast; }
    figcaption { padding: 6px 8px; font-size: 12px; color: #444; border-top: 1px solid #eee; background: #fff; }
    .pct { color: var(--muted); font-size: 12px; }
    .size-mismatch { color: var(--fail); font-weight: 600; font-size: 12px; }
    .sticky-summary { position: sticky; top: 0; background: #fff; padding: 8px 0; border-bottom: 1px solid #eee; margin-bottom: 12px; }
    .actions { margin-left: auto; }
    .actions button { font: inherit; padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; }
    .actions button[disabled] { opacity: 0.6; cursor: default; }
  </style>
  </head>
  <body>
    <header>
      <div class="sticky-summary">
        <h1>Visual Regression Report</h1>
        <div class="meta">Threshold: ${threshold} • ${json.total ?? records.length} total • ${json.failed ?? records.filter((r) => r.status !== 'passed').length} failed</div>
      </div>
    </header>
    <main>
`;

    let body = '';

    for (const r of records) {
        const urlPath = String(r.route || '').replace(/^examples\//, '');
        const suffix = r.mode === 'dark' ? '.dark' : '';
        // Use paths relative to report.html location (static/__vr/)
        const baselineUrl = `../examples/${urlPath}${suffix}.png`;
        const latestUrl = `latest/${urlPath}${suffix}.png`;
        const diffUrl = `diff/${urlPath}${suffix}.png`;
        const pct = r.percentage !== undefined ? (r.percentage * 100).toFixed(3) + '%' : '-';
        const statusText =
            r.status === 'passed'
                ? 'OK'
                : r.status === 'missing-baseline'
                  ? 'MISSING BASELINE'
                  : 'FAIL';
        const statusCls = r.status === 'passed' ? 'ok' : 'fail';
        const mismatch = r.sizeMismatch ? '<span class="size-mismatch">(size mismatch)</span>' : '';
        const parts = urlPath.split('/');
        const group = parts[0] || '';
        const page = parts.slice(1).join('/') || '';
        const key = `${group}/${page}`;

        body += `
      <section class="case ${escapeHtml(r.status)}" data-status="${escapeHtml(r.status)}" data-key="${escapeHtml(key)}">
        <div class="title">
          <span class="route">${escapeHtml(r.route)}</span>
          <span class="mode">${escapeHtml(r.mode)}</span>
          <span class="status ${statusCls}">[${statusText}]</span>
          <span class="pct">diff=${escapeHtml(pct)} ${mismatch}</span>
          <div class="actions" style="display: ${r.status === 'passed' ? 'none' : 'block'}">
            <button class="approve" data-group="${escapeHtml(group)}" data-page="${escapeHtml(page)}">Approve</button>
          </div>
        </div>
        <div class="grid">
          <figure>
            <img src="${baselineUrl}" alt="Expected baseline: ${escapeHtml(r.route)} ${escapeHtml(r.mode)}" />
            <figcaption>Expected</figcaption>
          </figure>
          <figure>
            <img src="${latestUrl}" alt="Actual latest: ${escapeHtml(r.route)} ${escapeHtml(r.mode)}" />
            <figcaption>Actual</figcaption>
          </figure>
          <figure>
            <img src="${diffUrl}" alt="Diff: ${escapeHtml(r.route)} ${escapeHtml(r.mode)}" />
            <figcaption>Diff</figcaption>
          </figure>
        </div>
      </section>`;
    }

    const foot = `
    </main>
    <script>
      document.addEventListener('click', async (ev) => {
        const btn = ev.target.closest('button.approve');
        if (!btn) return;
        const group = btn.dataset.group;
        const page = btn.dataset.page;
        const url = '/api/vr-tests/' + encodeURIComponent(group) + '/' + encodeURIComponent(page);
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Approving...';
        try {
          const res = await fetch(url, { method: 'POST' });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.ok !== true) throw new Error(data.error || 'Request failed');
          // Update all matching buttons to Approved
          const selector = 'button.approve[data-group="' + group.replace(/"/g, '\\"') + '"][data-page="' + page.replace(/"/g, '\\"') + '"]';
          document.querySelectorAll(selector).forEach((el) => {
            el.textContent = 'Approved';
            el.disabled = true;
          });
          // hide entire section
          const section = btn.closest('section.case');
          if (section) section.style.display = 'none';
        } catch (e) {
          btn.disabled = false;
          btn.textContent = original;
          alert('Failed to approve: ' + (e && e.message ? e.message : e));
        }
      });
    </script>
  </body>
</html>`;

    const html = head + body + foot;

    await ensureDir(VR_ROOT_DIR);
    await fs.writeFile(REPORT_HTML, html, 'utf8');

    console.log(
        `Wrote HTML report to ${REPORT_HTML}, open at http://localhost:5173/__vr/report.html`
    );
}

generate().catch((e) => {
    console.error(e);
    process.exit(1);
});
