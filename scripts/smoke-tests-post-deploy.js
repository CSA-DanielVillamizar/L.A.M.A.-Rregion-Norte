#!/usr/bin/env node

const { performance } = require('perf_hooks');

function parseArgs(argv) {
    const options = {};
    for (let index = 0; index < argv.length; index += 1) {
        const item = argv[index];
        if (item === '--base-url') {
            options.baseUrl = argv[index + 1];
            index += 1;
        }
        if (item === '--timeout-ms') {
            options.timeoutMs = Number(argv[index + 1]);
            index += 1;
        }
    }
    return options;
}

function normalizeBaseUrl(value) {
    const fromEnv = process.env.SMOKE_BASE_URL || process.env.BASE_URL;
    const fromArg = value;
    const baseUrl = fromArg || fromEnv || 'http://localhost:3000';
    return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function runCheck(baseUrl, route, validators, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = performance.now();

    try {
        const response = await fetch(`${baseUrl}${route}`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        const elapsed = Math.round(performance.now() - startedAt);
        const body = await response.text();

        if (response.status !== 200) {
            return {
                ok: false,
                route,
                elapsed,
                reason: `status ${response.status}`
            };
        }

        for (const validator of validators) {
            if (!validator(body)) {
                return {
                    ok: false,
                    route,
                    elapsed,
                    reason: 'validation content failed'
                };
            }
        }

        return {
            ok: true,
            route,
            elapsed,
            reason: 'ok'
        };
    } catch (error) {
        return {
            ok: false,
            route,
            elapsed: Math.round(performance.now() - startedAt),
            reason: error.name === 'AbortError' ? `timeout ${timeoutMs}ms` : error.message
        };
    } finally {
        clearTimeout(timer);
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const baseUrl = normalizeBaseUrl(args.baseUrl);
    const timeoutMs = args.timeoutMs || Number(process.env.SMOKE_TIMEOUT_MS || 15000);

    const tests = [
        {
            route: '/',
            validators: [
                (body) => body.includes('L.A.M.A.'),
                (body) => body.includes('og:image')
            ]
        },
        {
            route: '/eventos/vnorte-2026',
            validators: [
                (body) => body.includes('EXPLORA EL PARAISO') || body.includes('EPIC MOMENTS')
            ]
        },
        {
            route: '/itinerario',
            validators: [
                (body) => body.includes('mediaPorPunto')
            ]
        },
        {
            route: '/css/admin-ux.css',
            validators: [
                (body) => body.includes('.filter-section'),
                (body) => body.includes('.loading-spinner')
            ]
        },
        {
            route: '/js/admin-dashboard-ux.js',
            validators: [
                (body) => body.includes('class AdminDashboardUX'),
                (body) => body.includes('aplicarFiltros')
            ]
        },
        {
            route: '/js/toast-notification.js',
            validators: [
                (body) => body.includes('class ToastNotification')
            ]
        }
    ];

    console.log(`Smoke tests against ${baseUrl}`);
    const results = [];

    for (const test of tests) {
        const result = await runCheck(baseUrl, test.route, test.validators, timeoutMs);
        results.push(result);
        console.log(`${result.ok ? 'PASS' : 'FAIL'} ${test.route} (${result.elapsed}ms) - ${result.reason}`);
    }

    const failed = results.filter((item) => !item.ok);
    if (failed.length > 0) {
        console.error(`Smoke tests failed: ${failed.length}/${results.length}`);
        process.exit(1);
    }

    console.log(`Smoke tests passed: ${results.length}/${results.length}`);
}

main().catch((error) => {
    console.error(`Unexpected smoke test error: ${error.message}`);
    process.exit(1);
});
