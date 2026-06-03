import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils';
import { DeviceCard } from './deviceCard';
import {
  mockDevice,
  mockHomeWithDevices,
  mockOnlineNow,
  mockOnlineOffline,
  mockRoomWithDevices,
} from '../../../test-fixtures';
import { useOnline } from '../../../hooks/useOnline';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../hooks/useOnline');

describe('DeviceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnline).mockReturnValue({
      online: mockOnlineNow,
      loading: false,
      onlineError: undefined,
    });
  });

  it('renders the MAC address when the device has no name', () => {
    render(<DeviceCard device={mockDevice} />);
    // MAC appears twice: once as name fallback, once as dedicated mac row
    expect(screen.getAllByText('AA:BB:CC:DD:EE:FF').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the device name when set', () => {
    const deviceWithName = { ...mockDevice, name: 'My Sensor' };
    render(<DeviceCard device={deviceWithName} />);
    expect(screen.getByText('My Sensor')).toBeInTheDocument();
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
  });

  it('shows online status from the online API result', () => {
    render(<DeviceCard device={mockDevice} />);
    expect(screen.getByLabelText('Online')).toBeInTheDocument();
  });

  it('shows offline status from an old online API result', () => {
    vi.mocked(useOnline).mockReturnValue({
      online: mockOnlineOffline,
      loading: false,
      onlineError: undefined,
    });
    render(<DeviceCard device={mockDevice} />);
    expect(screen.getByLabelText('Offline')).toBeInTheDocument();
  });

  it('places the controller badge on the MAC row', () => {
    const controlDevice = {
      ...mockDevice,
      features: [
        ...mockDevice.features,
        {
          uuid: 'ctrl-1',
          name: 'on',
          type: 'controller',
          unit: '',
          order: 2,
          enable: true,
          spec: { format: 'bool' as const },
        },
      ],
    };
    render(<DeviceCard device={controlDevice} />);
    const macMatches = screen.getAllByText('AA:BB:CC:DD:EE:FF');
    expect(macMatches).toHaveLength(2);
    const macRow = macMatches[1]?.parentElement ?? null;
    expect(macRow).toContainElement(screen.getByText('Ctrl'));
  });

  it('navigates to device detail without home/room when clicked', async () => {
    render(<DeviceCard device={mockDevice} />);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(screen.getAllByText('AA:BB:CC:DD:EE:FF')[0]!);
    expect(mockNavigate).toHaveBeenCalledWith('/devices/d1', {
      state: { device: mockDevice },
    });
  });

  it('navigates to device detail with home and room state when clicked', async () => {
    render(
      <DeviceCard
        device={mockDevice}
        home={mockHomeWithDevices}
        room={mockRoomWithDevices}
      />,
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(screen.getAllByText('AA:BB:CC:DD:EE:FF')[0]!);
    expect(mockNavigate).toHaveBeenCalledWith('/devices/d1', {
      state: { device: mockDevice, home: mockHomeWithDevices, room: mockRoomWithDevices },
    });
  });
});
