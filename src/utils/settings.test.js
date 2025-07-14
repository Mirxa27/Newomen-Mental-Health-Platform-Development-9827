import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

let axiosInstance = null;
vi.mock('axios', () => {
  const axiosMock = vi.fn();
  axiosMock.create = vi.fn(() => {
    axiosInstance = {
      get: vi.fn(),
      put: vi.fn(),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
    };
    return axiosInstance;
  });
  return { default: axiosMock };
});

import axios from 'axios';
let apiModule;

describe('admin settings API helpers', () => {
  beforeAll(async () => {
    apiModule = await import('./api');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockResolvedValue({ data: { siteName: 'x' } });
    axiosInstance.put.mockResolvedValue({ data: { success: true } });
  });

  it('requests settings', async () => {
    const res = await apiModule.api.admin.getSettings();
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/settings');
    expect(res).toEqual({ data: { siteName: 'x' } });
  });

  it('updates settings', async () => {
    await apiModule.api.admin.updateSettings({ siteName: 'y' });
    expect(axiosInstance.put).toHaveBeenCalledWith('/admin/settings', { siteName: 'y' });
  });
});
