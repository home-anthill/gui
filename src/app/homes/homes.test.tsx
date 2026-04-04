import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test-utils';
import Homes from './homes';
import { useHomes } from '../../hooks/useHomes';
import { mockHome } from '../../test-fixtures';

vi.mock('../../hooks/useHomes');

const baseHomes = {
  homes: [],
  loading: false,
  homesError: undefined,
  trigger: vi.fn(),
  lazyHomes: [],
  lazyHomesLoading: false,
  lazyHomesError: undefined,
  deleteHome: vi.fn(),
  addHome: vi.fn(),
  updateHome: vi.fn(),
};

describe('Homes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Homes heading', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    expect(
      screen.getByRole('heading', { name: /^homes$/i }),
    ).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, loading: true });
    render(<Homes />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    vi.mocked(useHomes).mockReturnValue({
      ...baseHomes,
      homesError: { status: 'FETCH_ERROR' as const, error: 'Internal Server Error' },
    });
    render(<Homes />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('shows "No data to show" when the homes list is empty', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [] });
    render(<Homes />);
    expect(screen.getByText(/no data to show/i)).toBeInTheDocument();
  });

  it('renders a card for each home', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    render(<Homes />);
    expect(screen.getByText('My Home')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders the add (+) FAB button and opens the "Create a new home" dialog when FAB is clicked', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    // click on FAB
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/create a new home/i)).toBeInTheDocument();
  });

  it('closes the dialog when Cancel is clicked', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText(/create a new home/i)).not.toBeInTheDocument();
    });
  });
});
