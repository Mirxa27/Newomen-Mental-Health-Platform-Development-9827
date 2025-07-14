import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
  const axiosMock = vi.fn();
  axiosMock.create = vi.fn(() => ({
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }));
  return { default: axiosMock };
});

import * as apiModule from './api';
import axios from 'axios';

const mockAxios = axios;

describe('makeAuthenticatedRequest', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockAxios.mockResolvedValue({ data: { ok: true } });
  });

  it('adds Authorization header when token exists', async () => {
    apiModule.setAuthToken('abc123');

    await apiModule.makeAuthenticatedRequest('/test', { method: 'GET' });

    expect(mockAxios).toHaveBeenCalledWith('/test', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
      withCredentials: true
    }));
  });

  it('clears token and redirects on 401', async () => {
    apiModule.setAuthToken('abc123');
    delete window.location;
    window.location = { href: '/' };

    mockAxios.mockRejectedValueOnce({ response: { status: 401 } });

    await expect(apiModule.makeAuthenticatedRequest('/test')).rejects.toBeDefined();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(window.location.href).toBe('/auth/login');
  });
});
