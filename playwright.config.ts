import { defineConfig, devices } from '@playwright/test'

// Production runs on its own port so a running dev server can never be mistaken for it.
const prod = !!process.env.E2E_PROD
const port = prod ? 3100 : 3000
const baseURL = `http://localhost:${port}`
// Generators and timing probes run in their own projects (perf: one worker, quiet machine — D-113).
const generators = [/shots\.spec\.ts$/, /og\.spec\.ts$/, /perf\.spec\.ts$/]
// Next's CLI directly, not `pnpm start`/`pnpm dev`: pnpm 12's native launcher moves the server
// into its own process group, so Playwright could not stop it and hung after the run (D-104).
const next = 'node node_modules/next/dist/bin/next'

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: prod ? `${next} start --port ${port}` : `${next} dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !prod,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: generators,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testIgnore: generators,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'webkit',
      testIgnore: generators,
      // @smoke by default; E2E_WEBKIT_ALL=1 runs the whole suite (P14 QA, SECURITY §10).
      ...(process.env.E2E_WEBKIT_ALL ? {} : { grep: /@smoke/ }),
      use: { ...devices['Desktop Safari'] },
    },
    { name: 'shots', testMatch: /shots\.spec\.ts$/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'perf',
      testMatch: /perf\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'og',
      testMatch: /og\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1200, height: 630 } },
    },
  ],
})
