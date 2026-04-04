import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import { render, screen } from '../../test-utils';
import EditHome from './edithome';
import { useHomes } from '../../hooks/useHomes';
import { useRooms } from '../../hooks/useRooms';
import { mockHome } from '../../test-fixtures';

vi.mock('../../hooks/useHomes');
vi.mock('../../hooks/useRooms');

const baseHomes = {
  homes: [],
  loading: false,
  homesError: undefined,
  trigger: vi.fn().mockResolvedValue(undefined),
  lazyHomes: [mockHome],
  lazyHomesLoading: false,
  lazyHomesError: undefined,
  deleteHome: vi.fn(),
  addHome: vi.fn(),
  updateHome: vi
    .fn()
    .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
};

const baseRooms = {
  loading: false,
  deleteRoom: vi
    .fn()
    .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
  addRoom: vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
  updateRoom: vi
    .fn()
    .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }),
};

describe('EditHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHomes).mockReturnValue(baseHomes);
    vi.mocked(useRooms).mockReturnValue(baseRooms);
  });

  it('redirects to /main/homes when no id param is present', () => {
    render(
      <Routes>
        <Route path="/" element={<EditHome />} />
        <Route path="/main/homes" element={<div>Homes Page</div>} />
      </Routes>,
    );
    expect(screen.getByText('Homes Page')).toBeInTheDocument();
  });

  it('renders the Edit Home page', () => {
    render(
      <Routes>
        <Route path="/main/homes/:id/edit" element={<EditHome />} />
      </Routes>,
      { routerProps: { initialEntries: ['/main/homes/h1/edit'] } },
    );
    expect(
      screen.getByRole('heading', { name: /edit home/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^location$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save home/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /^rooms$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /\+ add room/i }),
    ).toBeInTheDocument();
  });
});
