import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowingComponent(): never {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders the error UI when a child component throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(
      screen.getByRole('heading', { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('calls window.location.reload when the Reload button is clicked', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(reloadMock).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
