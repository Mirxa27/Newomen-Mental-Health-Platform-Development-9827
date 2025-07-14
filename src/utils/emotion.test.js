import { describe, it, expect, vi, beforeEach } from 'vitest';

var axiosInstance = null;
vi.mock('axios', () => {
  const axiosMock = vi.fn();
  axiosMock.create = vi.fn(() => {
    axiosInstance = { post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } };
    return axiosInstance;
  });
  return { default: axiosMock };
});

import axios from 'axios';
let apiModule;

describe('api.emotion.analyze', () => {
  beforeAll(async () => {
    apiModule = await import('./api');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.post.mockResolvedValue({ data: { emotion: 'happy' } });
  });

  it('posts text to /emotion/analyze', async () => {
    const result = await apiModule.api.emotion.analyze('hello');
    expect(axiosInstance.post).toHaveBeenCalledWith('/emotion/analyze', { text: 'hello' });
    expect(result).toEqual({ data: { emotion: 'happy' } });
  });
});
