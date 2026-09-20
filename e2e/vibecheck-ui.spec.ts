import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR = 'C:/Users/Sri-Krishna/.gemini/antigravity-ide/brain/23dcb4d5-6703-43ea-8452-9b58141f6fc4';

test.describe('VibeCheck Configured Assets & Desktop Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport matching design system (1440px desktop)
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('Home page displays raw hero cutout and shortcut assets in Soft & Sharp styles', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.locator('h1')).toContainText('Good taste. All you.');

    // Verify Soft style default: female hero
    const heroImg = page.locator('.hero-model-img');
    await expect(heroImg).toBeVisible();
    const heroSrc = await heroImg.getAttribute('src');
    expect(heroSrc).toBe('/assets/demo-female-hero.png');

    // Verify shortcuts have real photography assets
    const shortcutImgs = page.locator('.shortcut-thumbnail img');
    await expect(shortcutImgs.nth(0)).toHaveAttribute('src', '/assets/female-portrait.png');
    await expect(shortcutImgs.nth(1)).toHaveAttribute('src', '/assets/female-outfit.png');
    await expect(shortcutImgs.nth(2)).toHaveAttribute('src', '/assets/garments.png');

    // Take screenshot of Soft Home
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-soft-home.png'), fullPage: true });

    // Switch to Sharp style
    const sharpBtn = page.getByRole('button', { name: 'Sharp' });
    await sharpBtn.click();

    // Verify Sharp style switch: male hero and thumbnails
    await expect(heroImg).toHaveAttribute('src', '/assets/hero-v2.png');
    await expect(shortcutImgs.nth(0)).toHaveAttribute('src', '/assets/male-portrait.png');
    await expect(shortcutImgs.nth(1)).toHaveAttribute('src', '/assets/male-outfit.png');

    // Take screenshot of Sharp Home
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-sharp-home.png'), fullPage: true });
  });

  test('Story Check displays raw portrait and notched ticket', async ({ page }) => {
    await page.goto('http://localhost:5173/story');
    const photo = page.locator('.story-photo-frame img');
    await expect(photo).toBeVisible();

    const photoSrc = await photo.getAttribute('src');
    expect(photoSrc).toBe('/assets/female-portrait.png');

    // Score ticket exists with large score
    await expect(page.locator('.score-ticket')).toBeVisible();
    await expect(page.locator('.score-val')).toContainText('92');

    // Screenshot of Story Check
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-story.png'), fullPage: true });
  });

  test('loox displays portrait with pins and hairstyle options', async ({ page }) => {
    await page.goto('http://localhost:5173/loox');
    const photo = page.locator('.loox-photo-container img');
    await expect(photo).toBeVisible();

    const photoSrc = await photo.getAttribute('src');
    expect(photoSrc).toBe('/assets/female-portrait.png');

    // Check style match banner
    await expect(page.locator('.style-match-banner')).toBeVisible();
    await expect(page.locator('.hair-options-grid')).toBeVisible();

    // Screenshot of loox
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-loox.png'), fullPage: true });
  });

  test('ChicFit displays 3D model stage and wardrobe grid', async ({ page }) => {
    await page.goto('http://localhost:5173/chicfit');
    await expect(page.locator('.model-preview-card')).toBeVisible();

    // Wardrobe grid with garment items
    await expect(page.locator('.garments-grid')).toBeVisible();

    // Screenshot of ChicFit wardrobe
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-chicfit.png'), fullPage: true });

    // Click Build an outfit
    await page.getByRole('button', { name: 'Build an outfit →' }).click();
    await expect(page.locator('h2', { hasText: 'Make it yours' })).toBeVisible();

    // Screenshot of ChicFit outfit stage
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'vibecheck-chicfit-outfit.png'), fullPage: true });
  });
});
