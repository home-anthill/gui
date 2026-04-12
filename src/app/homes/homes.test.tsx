import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test-utils';
import Homes from './homes';
import { useHomes } from '../../hooks/useHomes';
import { useRooms } from '../../hooks/useRooms';
import { mockHome } from '../../test-fixtures';

vi.mock('../../hooks/useHomes');
vi.mock('../../hooks/useRooms');

const baseHomes = {
  homes: [],
  loading: false,
  homesLoading: false,
  homesError: undefined,
  trigger: vi.fn(),
  lazyHomes: [],
  lazyHomesLoading: false,
  lazyHomesError: undefined,
  deleteHome: vi.fn(),
  addHome: vi.fn(),
  updateHome: vi.fn(),
};

const baseRooms = {
  loading: false,
  deleteRoom: vi.fn(),
  addRoom: vi.fn(),
  updateRoom: vi.fn(),
};

describe('Homes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRooms).mockReturnValue(baseRooms);
  });

  it('renders the Homes heading', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    expect(
      screen.getByRole('heading', { name: /^homes$/i }),
    ).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homesLoading: true });
    render(<Homes />);
    expect(
      screen.queryByRole('heading', { name: /^homes$/i }),
    ).not.toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    vi.mocked(useHomes).mockReturnValue({
      ...baseHomes,
      homesError: { status: 'FETCH_ERROR' as const, error: 'Internal Server Error' },
    });
    render(<Homes />);
    expect(screen.getByText(/could not load your homes/i)).toBeInTheDocument();
  });

  it('shows "No homes configured" when the homes list is empty', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [] });
    render(<Homes />);
    expect(screen.getByText(/no homes configured/i)).toBeInTheDocument();
  });

  it('renders a card for each home', () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    render(<Homes />);
    expect(screen.getByText('My Home')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('renders the Add Home button and opens the modal when clicked', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    const addButton = screen.getByRole('button', { name: 'Add Home' });
    expect(addButton).toBeInTheDocument();
    await userEvent.click(addButton);
    expect(await screen.findByPlaceholderText('Main Home')).toBeInTheDocument();
  });

  it('closes the modal when Cancel is clicked', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes });
    render(<Homes />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Home' }));
    // Wait for modal to appear before clicking Cancel
    await screen.findByPlaceholderText('Main Home');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Main Home')).not.toBeInTheDocument();
    });
  });

  it('opens the Edit Home modal with pre-filled values (handleOpenHomeModal with homeId)', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    render(<Homes />);
    await userEvent.click(screen.getByLabelText('Edit home'));
    expect(await screen.findByText('Edit Home')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Home')).toBeInTheDocument();
    expect(screen.getByDisplayValue('London')).toBeInTheDocument();
  });

  it('calls updateHome when Save is clicked in edit mode (handleSaveHome edit)', async () => {
    const updateHome = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome], updateHome });
    render(<Homes />);
    await userEvent.click(screen.getByLabelText('Edit home'));
    await screen.findByText('Edit Home');
    const nameInput = screen.getByDisplayValue('My Home');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Home');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() =>
      expect(updateHome).toHaveBeenCalledWith('h1', 'Updated Home', 'London'),
    );
  });

  it('calls addHome when Save is clicked in add mode (handleSaveHome add)', async () => {
    const addHome = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, addHome });
    render(<Homes />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Home' }));
    await screen.findByPlaceholderText('Main Home');
    await userEvent.type(screen.getByPlaceholderText('Main Home'), 'New Home');
    await userEvent.type(screen.getByPlaceholderText('123 Main St, New York'), 'New York');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(addHome).toHaveBeenCalledWith('New Home', 'New York'));
  });

  it('opens the Add Room modal when Add Room is clicked (handleOpenRoomModal add)', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    render(<Homes />);
    await userEvent.click(screen.getByText('My Home'));
    await userEvent.click(await screen.findByRole('button', { name: /add room/i }));
    expect(await screen.findByRole('heading', { name: /add room/i })).toBeInTheDocument();
  });

  it('calls addRoom when Save is clicked in Add Room modal (handleSaveRoom add)', async () => {
    const addRoom = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    vi.mocked(useRooms).mockReturnValue({ ...baseRooms, addRoom });
    render(<Homes />);
    await userEvent.click(screen.getByText('My Home'));
    await userEvent.click(await screen.findByRole('button', { name: /add room/i }));
    await screen.findByRole('heading', { name: /add room/i });
    await userEvent.type(screen.getByPlaceholderText('Living Room'), 'Kitchen');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() =>
      expect(addRoom).toHaveBeenCalledWith('h1', { name: 'Kitchen', floor: 0 }),
    );
  });

  it('opens the Edit Room modal with pre-filled values (handleOpenRoomModal edit)', async () => {
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    render(<Homes />);
    await userEvent.click(screen.getByText('My Home'));
    await userEvent.click(await screen.findByLabelText('Edit room'));
    expect(await screen.findByText('Edit Room')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Living Room')).toBeInTheDocument();
  });

  it('calls updateRoom when Save is clicked in edit room mode (handleSaveRoom edit)', async () => {
    const updateRoom = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    vi.mocked(useRooms).mockReturnValue({ ...baseRooms, updateRoom });
    render(<Homes />);
    await userEvent.click(screen.getByText('My Home'));
    await userEvent.click(await screen.findByLabelText('Edit room'));
    await screen.findByText('Edit Room');
    const nameInput = screen.getByDisplayValue('Living Room');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Bedroom');
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() =>
      expect(updateRoom).toHaveBeenCalledWith('h1', 'r1', { name: 'Bedroom', floor: 1 }),
    );
  });

  it('calls deleteHome when Delete is confirmed for a home (handleConfirmDelete home)', async () => {
    const deleteHome = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome], deleteHome });
    render(<Homes />);
    await userEvent.click(screen.getByLabelText('Delete home'));
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleteHome).toHaveBeenCalledWith('h1'));
  });

  it('calls deleteRoom when Delete is confirmed for a room (handleConfirmDelete room)', async () => {
    const deleteRoom = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    vi.mocked(useRooms).mockReturnValue({ ...baseRooms, deleteRoom });
    render(<Homes />);
    await userEvent.click(screen.getByText('My Home'));
    await userEvent.click(await screen.findByLabelText('Delete room'));
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleteRoom).toHaveBeenCalledWith('h1', 'r1'));
  });
});
