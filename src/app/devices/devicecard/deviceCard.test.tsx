import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils';
import { DeviceCard } from './deviceCard';
import { mockDevice, mockHomeWithDevices, mockRoomWithDevices } from '../../../test-fixtures';

const mockNavigate = vi.hoisted(() => vi.fn());
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('DeviceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('navigates to device detail without home/room when clicked', async () => {
    render(<DeviceCard device={mockDevice} />);
    await userEvent.click(screen.getAllByText('AA:BB:CC:DD:EE:FF')[0]);
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
    await userEvent.click(screen.getAllByText('AA:BB:CC:DD:EE:FF')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/devices/d1', {
      state: { device: mockDevice, home: mockHomeWithDevices, room: mockRoomWithDevices },
    });
  });
});
