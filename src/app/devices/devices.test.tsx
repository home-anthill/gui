import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import Devices from './devices';
import { useDevices } from '../../hooks/useDevices';
import { mockDevice, mockHomeWithDevices } from '../../test-fixtures';

vi.mock('../../hooks/useDevices');

// DeviceCard uses useNavigate from 'react-router'; mock it so tests don't need a real router
const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseDevices = {
  homeDevices: { unassignedDevices: [], homeDevices: [] },
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
    expect(
      screen.queryByRole('heading', { name: /^devices$/i }),
    ).not.toBeInTheDocument();
  });

  it('shows an error message when loading fails', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      error: { status: 'FETCH_ERROR' as const, error: 'Failed' },
    });
    render(<Devices />);
    expect(screen.getByText(/unable to load devices/i)).toBeInTheDocument();
  });

  it('shows "No devices found" when no devices exist', () => {
    vi.mocked(useDevices).mockReturnValue({ ...baseDevices });
    render(<Devices />);
    expect(screen.getByText(/no devices found/i)).toBeInTheDocument();
  });

  it('renders the Unassigned Devices section when unassigned devices exist', () => {
    vi.mocked(useDevices).mockReturnValue({
      ...baseDevices,
      homeDevices: { unassignedDevices: [mockDevice], homeDevices: [] },
    });
    render(<Devices />);
    expect(screen.getByText(/unassigned devices/i)).toBeInTheDocument();
  });

  it('renders a home with rooms and devices', () => {
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
  });
});
