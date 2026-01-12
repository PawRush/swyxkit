import { expect, test } from '@playwright/test';

test('about page loads', async ({ page }) => {
	await page.goto('/about');
	await expect(page.locator('body')).toContainText('SwyxKit');
});

test('blog page loads and has posts', async ({ page }) => {
	await page.goto('/blog');
	await expect(page.locator('h1')).toContainText('Blog');
	const posts = page.locator('ul li');
	await expect(posts.first()).toBeVisible();
});

test('blog search filters posts', async ({ page }) => {
	await page.goto('/blog');
	const searchInput = page.locator('[placeholder="Hit \\/ to search"]');
	await searchInput.fill('test');
	await expect(page).toHaveURL(/filter=test/);
});

test('home page loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('body')).toBeVisible();
});

test('dark mode toggle works', async ({ page }) => {
	await page.goto('/');
	const themeToggle = page.locator('button[aria-label="Toggle Dark Mode"]');
	const html = page.locator('html');
	const initialDark = await html.evaluate((el) => el.classList.contains('dark'));
	await themeToggle.click();
	await expect(html).toHaveClass(initialDark ? /^(?!.*dark)/ : /dark/);
});
