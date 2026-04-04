import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import Devices from './devices';
import { useDevices } from '../../hooks/useDevices';
import {
  mockDevice,
  mockDevice2,
  mockHomeWithDevices,
} from '../../test-fixtures';
import { DevicesResponse } from '../../models/device';

vi.mock('../../hooks/useDevices');

const emptyDevices: DevicesResponse = {
  unassignedDevices: [],
  homeDevices: [],
};

const baseDevices = {
  homeDevices: emptyDevices,
  loading: false,
  error: undefined,
  assignDeviceHomeRoom: vi.fn(),
  deleteDevice: vi.fn(),
};

describe('Devices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Devices heading', () => {
    vi.mocked(useDevices).mockReturnValue({ ...baseDevices });
    render(<Devices />);
    expect(
      screen.getByRole('heading', { name: /^devices$/i }),
    ).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    vi.mocked(useDevices).mockReturnValue({ ...baseDevices, loading: true });
    render(<Devices />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error message when the request fails', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      error: { status: 'FETCH_ERROR' as const, error: 'Server error' },
    });
    render(<Devices />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('shows "No data to show" when there are no devices', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      homeDevices: emptyDevices,
    });
    render(<Devices />);
    expect(screen.getByText(/no data to show/i)).toBeInTheDocument();
  });

  it('renders unassigned devices', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      homeDevices: { unassignedDevices: [mockDevice2], homeDevices: [] },
    });
    render(<Devices />);
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();
    expect(screen.getByText('11:22:33:44:55:66')).toBeInTheDocument();
  });

  it('renders devices grouped by home and room', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      homeDevices: {
        unassignedDevices: [],
        homeDevices: [mockHomeWithDevices],
      },
    });
    render(<Devices />);
    expect(screen.getByText(/My Home/)).toBeInTheDocument();
    expect(screen.getByText(/Living Room/)).toBeInTheDocument();
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
  });

  it('shows "No devices to show" for a room with no devices', () => {
    const homeWithEmptyRoom = {
      ...mockHomeWithDevices,
      rooms: [{ ...mockHomeWithDevices.rooms[0], devices: [] }],
    };
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      homeDevices: { unassignedDevices: [], homeDevices: [homeWithEmptyRoom] },
    });
    render(<Devices />);
    expect(screen.getByText(/no devices to show/i)).toBeInTheDocument();
  });
});
