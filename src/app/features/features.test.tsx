import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import { Route, Routes } from 'react-router-dom';
import Features from './features';
import { useValues } from '../../hooks/useValues';
import {
  mockDevice,
  mockDeviceWithValues,
  makeFeatureValue,
} from '../../test-fixtures';

vi.mock('../../hooks/useValues');

const baseValues = {
  deviceWithValues: undefined as unknown as ReturnType<
    typeof useValues
  >['deviceWithValues'],
  loading: false,
  deviceWithValuesError: undefined,
  trigger: vi.fn(),
  lazyDeviceWithValues: undefined as unknown as ReturnType<
    typeof useValues
  >['lazyDeviceWithValues'],
  lazyDeviceWithValuesLoading: false,
  lazyDeviceWithValuesError: undefined,
  setValues: vi.fn(),
};

describe('Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /main/devices when no device is in location state', () => {
    vi.mocked(useValues).mockReturnValue(baseValues);
    render(
      <Routes>
        <Route path="/" element={<Features />} />
        <Route path="/main/devices" element={<div>Devices Page</div>} />
      </Routes>,
    );
    expect(screen.getByText('Devices Page')).toBeInTheDocument();
  });

  it('renders the Device heading when a device is provided', () => {
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValues: mockDeviceWithValues,
    });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(
      screen.getByRole('heading', { name: /^device$/i }),
    ).toBeInTheDocument();
  });

  it('shows the loading state', () => {
    vi.mocked(useValues).mockReturnValue({ ...baseValues, loading: true });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows an error message when the values request fails', () => {
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValuesError: { status: 'FETCH_ERROR' as const, error: 'Error' },
    });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('shows "No data to show" when deviceWithValues is empty', () => {
    vi.mocked(useValues).mockReturnValue({ ...baseValues });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(screen.getByText(/no data to show/i)).toBeInTheDocument();
  });

  it('renders the device MAC from deviceWithValues', () => {
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValues: mockDeviceWithValues,
    });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
  });

  it('renders home and room info when provided in state', () => {
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValues: mockDeviceWithValues,
    });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [
            {
              pathname: '/',
              state: {
                device: mockDevice,
                home: { name: 'My Home', location: 'London' },
                room: { name: 'Living Room', floor: 1 },
              },
            },
          ],
        },
      },
    );
    expect(screen.getByText(/My Home.*London/)).toBeInTheDocument();
    expect(screen.getByText(/Living Room/)).toBeInTheDocument();
  });

  it('renders sensor features', () => {
    const dwv = {
      ...mockDeviceWithValues,
      features: [
        makeFeatureValue({ name: 'temperature', type: 'sensor', value: 21.0 }),
      ],
    };
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValues: dwv,
    });
    render(
      <Routes>
        <Route path="/" element={<Features />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [{ pathname: '/', state: { device: mockDevice } }],
        },
      },
    );
    expect(screen.getByText('TEMPERATURE')).toBeInTheDocument();
  });
});
