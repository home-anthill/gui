import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';

import DeviceSettings from './devicesettings';
import { render, screen } from '../../test-utils';
import { useHomes } from '../../hooks/useHomes';
import { useDevices } from '../../hooks/useDevices';
import { mockDevice, mockHome } from '../../test-fixtures';

vi.mock('../../hooks/useHomes');
vi.mock('../../hooks/useDevices');

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
  updateHome: vi.fn(),
};

const baseDevices = {
  homeDevices: { unassignedDevices: [], homeDevices: [] },
  loading: false,
  error: undefined,
  assignDeviceHomeRoom: vi.fn(),
  deleteDevice: vi
    .fn()
    .mockReturnValue({ unwrap: vi.fn().mockResolvedValue(undefined) }),
};

describe('DeviceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHomes).mockReturnValue(baseHomes);
    vi.mocked(useDevices).mockReturnValue(baseDevices);
  });

  it('redirects to /main/devices when no device is in location state', () => {
    render(
      <Routes>
        <Route path="/" element={<DeviceSettings />} />
        <Route path="/main/devices" element={<div>Devices Page</div>} />
      </Routes>,
    );
    expect(screen.getByText('Devices Page')).toBeInTheDocument();
  });

  it('renders the Settings heading when a device is provided', () => {
    render(
      <Routes>
        <Route path="/" element={<DeviceSettings />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(
      screen.getByRole('heading', { name: /^settings$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
    expect(
      screen.getByText(/Acme.*Sensor-X|Sensor-X.*Acme/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /remove this device/i }),
    ).toBeInTheDocument();
  });
});
