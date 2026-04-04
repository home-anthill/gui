import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import { Route, Routes } from 'react-router-dom';
import Main from './main';
import { useProfile } from '../hooks/useProfile';
import { mockProfile } from '../test-fixtures';

vi.mock('../hooks/useProfile');
vi.mock('../assets/home-anthill.png', () => ({ default: 'mocked-logo.png' }));

describe('Main', () => {
  beforeEach(() => {
    vi.mocked(useProfile).mockReturnValue({
      profile: mockProfile,
      loading: false,
      profileError: undefined,
      newProfileToken: vi.fn(),
    });
  });

  it('renders the Navbar', () => {
    render(
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    );
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('renders the routed child content via Outlet', () => {
    render(
      <Routes>
        <Route path="/" element={<Main />}>
          <Route index element={<div>Child Content</div>} />
        </Route>
      </Routes>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
