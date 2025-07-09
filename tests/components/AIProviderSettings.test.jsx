import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AIProviderSettings from '../../src/components/admin/AIProviderSettings';
import { useAIProviderStore } from '../../src/store/aiProviderStore';

// Mock the store
vi.mock('../../src/store/aiProviderStore', () => ({
  useAIProviderStore: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockStoreValues = {
  providers: [
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai',
      apiKey: 'sk-test-key',
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      isActive: true,
      isDefault: true,
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
    },
  ],
  addProvider: vi.fn(),
  updateProvider: vi.fn(),
  deleteProvider: vi.fn(),
  setDefaultProvider: vi.fn(),
  toggleActive: vi.fn(),
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AIProviderSettings', () => {
  beforeEach(() => {
    useAIProviderStore.mockReturnValue(mockStoreValues);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders provider settings correctly', () => {
    renderWithRouter(<AIProviderSettings />);
    
    expect(screen.getByText('ai-provider-settings.title')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
  });

  it('allows adding a new provider', async () => {
    renderWithRouter(<AIProviderSettings />);
    
    const addButton = screen.getByText('ai-provider-settings.add-provider');
    fireEvent.click(addButton);
    
    expect(screen.getByText('ai-provider-settings.add-new-provider')).toBeInTheDocument();
  });

  it('prevents deleting the default provider', () => {
    renderWithRouter(<AIProviderSettings />);
    
    const deleteButton = screen.getByLabelText('Delete provider');
    fireEvent.click(deleteButton);
    
    expect(mockStoreValues.deleteProvider).not.toHaveBeenCalled();
  });

  it('toggles provider active state', () => {
    renderWithRouter(<AIProviderSettings />);
    
    const toggleButton = screen.getByLabelText('Toggle active state');
    fireEvent.click(toggleButton);
    
    expect(mockStoreValues.toggleActive).toHaveBeenCalledWith('openai');
  });

  it('updates provider settings', async () => {
    renderWithRouter(<AIProviderSettings />);
    
    const editButton = screen.getByLabelText('Edit provider');
    fireEvent.click(editButton);
    
    const nameInput = screen.getByDisplayValue('OpenAI');
    fireEvent.change(nameInput, { target: { value: 'Updated OpenAI' } });
    
    const saveButton = screen.getByText('common.save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockStoreValues.updateProvider).toHaveBeenCalledWith(
        'openai',
        expect.objectContaining({ name: 'Updated OpenAI' })
      );
    });
  });

  it('validates required fields when adding provider', async () => {
    renderWithRouter(<AIProviderSettings />);
    
    const addButton = screen.getByText('ai-provider-settings.add-provider');
    fireEvent.click(addButton);
    
    const saveButton = screen.getByText('common.save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('ai-provider-settings.name-required')).toBeInTheDocument();
    });
  });

  it('hides API keys by default', () => {
    renderWithRouter(<AIProviderSettings />);
    
    expect(screen.getByDisplayValue('••••••••••••••••')).toBeInTheDocument();
  });

  it('shows API keys when toggle is clicked', () => {
    renderWithRouter(<AIProviderSettings />);
    
    const showKeyButton = screen.getByLabelText('Show API key');
    fireEvent.click(showKeyButton);
    
    expect(screen.getByDisplayValue('sk-test-key')).toBeInTheDocument();
  });
});
