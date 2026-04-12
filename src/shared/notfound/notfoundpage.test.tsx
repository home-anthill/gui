import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils';
import { NotFoundPage } from './notfoundpage';

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the Page not found heading', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it('renders the Back to Home button', () => {
    render(<NotFoundPage />);
    expect(
      screen.getByRole('button', { name: /back to home/i }),
    ).toBeInTheDocument();
  });

  it('sets window.location.href to "/" when Back to Home is clicked', async () => {
    const locationMock = { href: '' };
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    });
    render(<NotFoundPage />);
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(locationMock.href).toBe('/');
  });
});
