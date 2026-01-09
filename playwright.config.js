/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	use: {
		baseURL: process.env.BASE_URL ?? 'http://localhost:4173',
	},
	webServer: process.env.BASE_URL
		? undefined
		: {
				command: 'npm run build && npm run preview',
				port: 4173
			},
	testDir: 'tests',
	testMatch: '**/*.{test,spec}.{js,ts,mjs}'
};

export default config;
