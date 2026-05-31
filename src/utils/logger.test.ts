import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import { logError } from './logger';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('logError', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('logs the error and shows an error toast', () => {
    const error = new Error('failure');

    logError('Cannot complete action', error);

    expect(consoleError).toHaveBeenCalledWith('Cannot complete action', error);
    expect(toast.error).toHaveBeenCalledWith('Cannot complete action');
  });
});
