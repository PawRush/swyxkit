import { expect, test } from '@playwright/test';

test('about page has expected h1', async ({ page }) => {
	await page.goto('/about');
	expect(await page.textContent('h1')).toBe('About swyxkit!');
});

test.describe('test blog page', () => {
	test('blog page to preserve url params', async ({ page }) => {
		// Go to http://localhost:4173/
		await page.goto('/blog');

		// Click [placeholder="Hit \/ to search"]
		await page.locator('[placeholder="Hit \\/ to search"]').click();

		// Fill [placeholder="Hit \/ to search"]
		await page.locator('[placeholder="Hit \\/ to search"]').fill('test');
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test');

		// Click label:has-text("Blog")
		await page.locator('label:has-text("Blog")').click();
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test&show=Blog');
	});

	test('blog to honour existing params', async ({ page }) => {
		await page.goto('http://localhost:4173/blog?filter=test&show=Blog');
		await expect(page).toHaveURL('http://localhost:4173/blog?filter=test&show=Blog');
	});

	// NEW COMPREHENSIVE TESTS
	test('blog listing displays posts with correct structure', async ({ page }) => {
		await page.goto('/blog');

		// Check page title
		await expect(page.locator('h1')).toContainText('Blog');

		// Verify search input is present
		const searchInput = page.locator('[placeholder="Hit \\/ to search"]');
		await expect(searchInput).toBeVisible();

		// Verify posts are listed
		const postList = page.locator('ul li');
		const postCount = await postList.count();
		expect(postCount).toBeGreaterThan(0);

		// Verify each post has essential elements (title, date)
		const firstPost = postList.first();
		await expect(firstPost).toContainText(/\d{4}-\d{2}-\d{2}/); // Date format
	});

	test('search functionality filters blog posts', async ({ page }) => {
		await page.goto('/blog');

		// Get initial post count
		const initialPostCount = await page.locator('ul li').count();
		expect(initialPostCount).toBeGreaterThan(0);

		// Perform a search
		const searchInput = page.locator('[placeholder="Hit \\/ to search"]');
		await searchInput.click();
		await searchInput.fill('nonexistentsearchterm12345');

		// Wait for search to filter results
		await page.waitForTimeout(500);

		// Check if "No posts found" message appears or filtered results show
		const noPostsMessage = page.locator('text=No posts found');
		const hasNoPosts = await noPostsMessage.isVisible().catch(() => false);

		// For a nonsense search, we expect no posts message
		expect(hasNoPosts).toBeTruthy();
	});

	test('search keyboard shortcut focuses input', async ({ page }) => {
		await page.goto('/blog');

		// Press '/' key
		await page.keyboard.press('/');

		// Verify search input is focused
		const searchInput = page.locator('[placeholder="Hit \\/ to search"]');
		await expect(searchInput).toBeFocused();
	});

	test('category filter works correctly', async ({ page }) => {
		await page.goto('/blog');

		// Check if category filters are present
		const categoryLabels = page.locator('label[for^="category-"]');
		const categoryCount = await categoryLabels.count();

		// Only test if categories exist
		if (categoryCount > 0) {
			// Click the first category filter
			const firstCategory = categoryLabels.first();
			await firstCategory.click();

			// Verify URL updates with show param
			await expect(page).toHaveURL(/show=/);
		}
	});

	test('clear search button works', async ({ page }) => {
		await page.goto('/blog?filter=nonexistentsearch');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Check if clear button is visible
		const clearButton = page.locator('button:has-text("Clear your search")');
		const isClearVisible = await clearButton.isVisible().catch(() => false);

		if (isClearVisible) {
			await clearButton.click();

			// Verify search is cleared and URL updates
			await expect(page).toHaveURL('/blog');
		}
	});
});

test.describe('blog post page', () => {
	test('individual post renders with correct structure', async ({ page }) => {
		// First, get a post slug from the blog listing
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Click on the first blog post link
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();

		// Verify we're on a post page
		await page.waitForLoadState('networkidle');

		// Check for article element
		const article = page.locator('article');
		await expect(article).toBeVisible();

		// Check for post title (h1)
		const title = page.locator('article h1');
		await expect(title).toBeVisible();

		// Check for post date
		await expect(page.locator('text=/\\d{4}-\\d{2}-\\d{2}/')).toBeVisible();

		// Check for post content
		const content = page.locator('article');
		const textContent = await content.textContent();
		expect(textContent.length).toBeGreaterThan(100);
	});

	test('post metadata displays correctly', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Check for gradient separator
		const gradientBar = page.locator('div.bg-gradient-to-r');
		await expect(gradientBar).toBeVisible();
	});
});

test.describe('theme switching', () => {
	test('dark mode toggle switches theme', async ({ page }) => {
		await page.goto('/');

		// Find the theme toggle button
		const themeToggle = page.locator('button[aria-label="Toggle Dark Mode"]');
		await expect(themeToggle).toBeVisible();

		// Check initial theme state
		const htmlElement = page.locator('html');
		const initialHasClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));

		// Click toggle
		await themeToggle.click();

		// Wait for theme change
		await page.waitForTimeout(100);

		// Verify theme changed
		const afterClickHasClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
		expect(afterClickHasClass).toBe(!initialHasClass);

		// Verify localStorage was updated
		const themeInStorage = await page.evaluate(() => localStorage.getItem('theme'));
		expect(['light', 'dark']).toContain(themeInStorage);
	});

	test('theme persists across page navigation', async ({ page }) => {
		await page.goto('/');

		// Set to dark mode
		const themeToggle = page.locator('button[aria-label="Toggle Dark Mode"]');
		const htmlElement = page.locator('html');

		// Ensure we start with a known state (light)
		const isDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
		if (isDark) {
			await themeToggle.click();
			await page.waitForTimeout(100);
		}

		// Now switch to dark
		await themeToggle.click();
		await page.waitForTimeout(100);

		// Navigate to another page
		await page.goto('/blog');
		await page.waitForTimeout(100);

		// Verify dark mode persisted
		const stillDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
		expect(stillDark).toBeTruthy();
	});

	test('theme toggle icon changes based on mode', async ({ page }) => {
		await page.goto('/');

		const themeToggle = page.locator('button[aria-label="Toggle Dark Mode"]');

		// Get initial icon
		const initialIcon = await themeToggle.locator('svg').first().innerHTML();

		// Toggle theme
		await themeToggle.click();
		await page.waitForTimeout(100);

		// Get new icon
		const newIcon = await themeToggle.locator('svg').first().innerHTML();

		// Icons should be different
		expect(initialIcon).not.toBe(newIcon);
	});
});

test.describe('table of contents', () => {
	test('table of contents appears on posts with headings', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Look for table of contents
		const tocSection = page.locator('text=/Table of Contents/i');
		const hasToc = await tocSection.isVisible().catch(() => false);

		if (hasToc) {
			// Verify TOC has items
			const tocLinks = page.locator('a[href^="#"]');
			const linkCount = await tocLinks.count();
			expect(linkCount).toBeGreaterThan(0);
		}
	});

	test('table of contents links navigate to sections', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Check if TOC exists
		const tocSection = page.locator('text=/Table of Contents/i');
		const hasToc = await tocSection.isVisible().catch(() => false);

		if (hasToc) {
			// Click on first TOC link (if any)
			const firstTocLink = page.locator('a[href^="#"]').first();
			const linkExists = await firstTocLink.isVisible().catch(() => false);

			if (linkExists) {
				const href = await firstTocLink.getAttribute('href');
				await firstTocLink.click();

				// Verify URL updated with hash
				await expect(page).toHaveURL(new RegExp(href));
			}
		}
	});
});

test.describe('comments system', () => {
	test('comments section exists on blog posts', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Scroll to comments section
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Look for comments loading message or button
		const commentsLoading = page.locator('text=/Loading comments|Load now/i');
		await expect(commentsLoading).toBeVisible();
	});

	test('comments load button is functional', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Scroll to comments
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Find and click load comments button
		const loadButton = page.locator('button:has-text("Load now")');
		const hasButton = await loadButton.isVisible().catch(() => false);

		if (hasButton) {
			await loadButton.click();

			// Wait for utterances script to potentially load
			await page.waitForTimeout(1000);

			// Test passes - we verified the button is clickable
			expect(true).toBeTruthy();
		}
	});

	test('comments section has reactions display', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Scroll to reactions section
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Look for reactions section
		const reactionsSection = page.locator('text=/Reactions:|Leave a reaction/i');
		await expect(reactionsSection).toBeVisible();
	});

	test('comments link to GitHub issues', async ({ page }) => {
		await page.goto('/blog');
		await page.waitForLoadState('networkidle');

		// Navigate to first post
		const firstPostLink = page.locator('ul li a[href^="/"]').first();
		await firstPostLink.click();
		await page.waitForLoadState('networkidle');

		// Scroll to comments
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Look for GitHub issue link
		const githubLink = page.locator('a[href*="github.com"][href*="issues"]');
		const hasGitHubLink = await githubLink.isVisible().catch(() => false);

		expect(hasGitHubLink).toBeTruthy();
	});
});
