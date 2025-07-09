import { test, expect } from '@playwright/test';

test.describe('Admin Panel - AI Provider Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('newomen-auth', JSON.stringify({
        state: {
          user: {
            id: 'admin-1',
            email: 'admin@newomen.com',
            role: 'admin',
            isAuthenticated: true,
          },
          subscription: {
            plan: 'premium',
            minutesRemaining: 1000,
          },
        },
      }));
    });

    await page.goto('/admin');
  });

  test('loads admin dashboard successfully', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
  });

  test('navigates to AI Provider Settings', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    await expect(page.locator('h2')).toContainText('AI Provider Settings');
    await expect(page.locator('[data-testid="providers-list"]')).toBeVisible();
  });

  test('displays default OpenAI provider', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    await expect(page.locator('[data-testid="provider-openai"]')).toBeVisible();
    await expect(page.locator('[data-testid="provider-openai"] .provider-name')).toContainText('OpenAI');
    await expect(page.locator('[data-testid="provider-openai"] .provider-model')).toContainText('gpt-4o');
    await expect(page.locator('[data-testid="provider-openai"] .default-badge')).toBeVisible();
  });

  test('adds new provider successfully', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    await page.click('[data-testid="add-provider-btn"]');
    
    // Fill out the form
    await page.fill('[data-testid="provider-name-input"]', 'Test Anthropic');
    await page.selectOption('[data-testid="provider-type-select"]', 'anthropic');
    await page.fill('[data-testid="provider-apikey-input"]', 'sk-ant-test-key');
    await page.fill('[data-testid="provider-endpoint-input"]', 'https://api.anthropic.com');
    await page.fill('[data-testid="provider-model-input"]', 'claude-3-haiku');
    
    await page.click('[data-testid="save-provider-btn"]');
    
    // Verify success message
    await expect(page.locator('.toast-success')).toContainText('Provider settings saved successfully');
    
    // Verify provider appears in list
    await expect(page.locator('[data-testid="provider-test-anthropic"]')).toBeVisible();
  });

  test('validates required fields when adding provider', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    await page.click('[data-testid="add-provider-btn"]');
    
    // Try to save without filling required fields
    await page.click('[data-testid="save-provider-btn"]');
    
    await expect(page.locator('.field-error')).toContainText('Name is required');
  });

  test('edits existing provider', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // Click edit button on OpenAI provider
    await page.click('[data-testid="provider-openai"] [data-testid="edit-provider-btn"]');
    
    // Change the name
    await page.fill('[data-testid="provider-name-input"]', 'Updated OpenAI');
    await page.click('[data-testid="save-provider-btn"]');
    
    // Verify success message and updated name
    await expect(page.locator('.toast-success')).toContainText('Provider settings saved successfully');
    await expect(page.locator('[data-testid="provider-openai"] .provider-name')).toContainText('Updated OpenAI');
  });

  test('prevents deletion of default provider', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // Try to delete the default provider
    await page.click('[data-testid="provider-openai"] [data-testid="delete-provider-btn"]');
    
    // Should show error message
    await expect(page.locator('.toast-error')).toContainText('Cannot delete the default provider');
    
    // Provider should still be visible
    await expect(page.locator('[data-testid="provider-openai"]')).toBeVisible();
  });

  test('toggles provider active state', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // First add a non-default provider
    await page.click('[data-testid="add-provider-btn"]');
    await page.fill('[data-testid="provider-name-input"]', 'Test Provider');
    await page.selectOption('[data-testid="provider-type-select"]', 'anthropic');
    await page.fill('[data-testid="provider-apikey-input"]', 'test-key');
    await page.click('[data-testid="save-provider-btn"]');
    
    // Toggle the active state
    await page.click('[data-testid="provider-test-provider"] [data-testid="toggle-active-btn"]');
    
    // Verify the toggle changed state
    await expect(page.locator('[data-testid="provider-test-provider"] .active-indicator')).toHaveClass(/active/);
  });

  test('sets new default provider', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // Add a new provider
    await page.click('[data-testid="add-provider-btn"]');
    await page.fill('[data-testid="provider-name-input"]', 'Test Provider');
    await page.selectOption('[data-testid="provider-type-select"]', 'anthropic');
    await page.fill('[data-testid="provider-apikey-input"]', 'test-key');
    await page.click('[data-testid="save-provider-btn"]');
    
    // Set as default
    await page.click('[data-testid="provider-test-provider"] [data-testid="set-default-btn"]');
    
    // Verify default badge moved
    await expect(page.locator('[data-testid="provider-test-provider"] .default-badge')).toBeVisible();
    await expect(page.locator('[data-testid="provider-openai"] .default-badge')).not.toBeVisible();
  });

  test('hides and shows API keys', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // API key should be hidden by default
    await expect(page.locator('[data-testid="provider-openai"] .api-key-display')).toContainText('••••••••••••••••');
    
    // Click show button
    await page.click('[data-testid="provider-openai"] [data-testid="show-api-key-btn"]');
    
    // Should show actual key (mocked)
    await expect(page.locator('[data-testid="provider-openai"] .api-key-display')).not.toContainText('••••••••••••••••');
  });

  test('validates API key format for different providers', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    await page.click('[data-testid="add-provider-btn"]');
    
    // Test OpenAI key validation
    await page.selectOption('[data-testid="provider-type-select"]', 'openai');
    await page.fill('[data-testid="provider-apikey-input"]', 'invalid-key');
    await page.blur('[data-testid="provider-apikey-input"]');
    
    await expect(page.locator('.field-error')).toContainText('OpenAI API keys must start with "sk-"');
    
    // Test Anthropic key validation
    await page.selectOption('[data-testid="provider-type-select"]', 'anthropic');
    await page.fill('[data-testid="provider-apikey-input"]', 'invalid-key');
    await page.blur('[data-testid="provider-apikey-input"]');
    
    await expect(page.locator('.field-error')).toContainText('Anthropic API keys must start with "sk-ant-"');
  });

  test('persists settings after page reload', async ({ page }) => {
    await page.click('[data-testid="nav-ai-providers"]');
    
    // Add a provider
    await page.click('[data-testid="add-provider-btn"]');
    await page.fill('[data-testid="provider-name-input"]', 'Persistent Provider');
    await page.selectOption('[data-testid="provider-type-select"]', 'anthropic');
    await page.fill('[data-testid="provider-apikey-input"]', 'sk-ant-persistent');
    await page.click('[data-testid="save-provider-btn"]');
    
    // Reload the page
    await page.reload();
    
    // Navigate back to settings
    await page.click('[data-testid="nav-ai-providers"]');
    
    // Verify provider is still there
    await expect(page.locator('[data-testid="provider-persistent-provider"]')).toBeVisible();
    await expect(page.locator('[data-testid="provider-persistent-provider"] .provider-name')).toContainText('Persistent Provider');
  });
});

test.describe('Admin Panel - Prompt Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('newomen-auth', JSON.stringify({
        state: {
          user: {
            id: 'admin-1',
            email: 'admin@newomen.com',
            role: 'admin',
            isAuthenticated: true,
          },
        },
      }));
    });

    await page.goto('/admin');
    await page.click('[data-testid="nav-prompts"]');
  });

  test('loads prompt management interface', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Prompt Management');
    await expect(page.locator('[data-testid="prompts-list"]')).toBeVisible();
  });

  test('creates new system prompt', async ({ page }) => {
    await page.click('[data-testid="add-prompt-btn"]');
    
    await page.fill('[data-testid="prompt-title-input"]', 'Test System Prompt');
    await page.selectOption('[data-testid="prompt-category-select"]', 'system');
    await page.fill('[data-testid="prompt-content-textarea"]', 'You are a helpful mental health assistant...');
    
    await page.click('[data-testid="save-prompt-btn"]');
    
    await expect(page.locator('.toast-success')).toContainText('Prompt saved successfully');
    await expect(page.locator('[data-testid="prompt-test-system-prompt"]')).toBeVisible();
  });

  test('edits existing prompt', async ({ page }) => {
    // Assuming there's a default prompt
    await page.click('[data-testid="prompt-default"] [data-testid="edit-prompt-btn"]');
    
    await page.fill('[data-testid="prompt-content-textarea"]', 'Updated prompt content...');
    await page.click('[data-testid="save-prompt-btn"]');
    
    await expect(page.locator('.toast-success')).toContainText('Prompt updated successfully');
  });

  test('filters prompts by category', async ({ page }) => {
    await page.selectOption('[data-testid="category-filter"]', 'crisis');
    
    // Should only show crisis prompts
    await expect(page.locator('[data-testid="prompts-list"] .prompt-card[data-category="crisis"]')).toBeVisible();
    await expect(page.locator('[data-testid="prompts-list"] .prompt-card[data-category="system"]')).not.toBeVisible();
  });

  test('validates prompt content', async ({ page }) => {
    await page.click('[data-testid="add-prompt-btn"]');
    
    // Try to save without content
    await page.fill('[data-testid="prompt-title-input"]', 'Test');
    await page.click('[data-testid="save-prompt-btn"]');
    
    await expect(page.locator('.field-error')).toContainText('Content is required');
  });
});
