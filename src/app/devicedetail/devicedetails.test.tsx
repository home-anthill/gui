import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test-utils';
import DeviceDetail from './devicedetails';
import { useHomes } from '../../hooks/useHomes';
import { useDevices } from '../../hooks/useDevices';
import { useValues } from '../../hooks/useValues';
import * as ReactRouter from 'react-router';
import {
  mockDevice,
  mockHome,
  mockHomeWithDevices,
  mockRoomWithDevices,
  mockDeviceWithValues,
  makeFeatureValue,
} from '../../test-fixtures';

vi.mock('../../hooks/useHomes');
vi.mock('../../hooks/useDevices');
vi.mock('../../hooks/useValues');
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: vi.fn() };
});

// ─── Mock base state ──────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

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

const baseDevices = {
  homeDevices: { unassignedDevices: [], homeDevices: [] },
  loading: false,
  error: undefined,
  assignDeviceHomeRoom: vi.fn(),
  deleteDevice: vi.fn(),
};

const baseValues = {
  deviceWithValues: mockDeviceWithValues,
  loading: false,
  isSending: false,
  deviceWithValuesError: undefined,
  setValues: vi.fn(),
  trigger: vi.fn(),
  lazyDeviceWithValues: undefined,
  lazyDeviceWithValuesLoading: false,
  lazyDeviceWithValuesError: undefined,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithDevice() {
  return render(<DeviceDetail />, {
    routerProps: {
      initialEntries: [
        {
          pathname: '/devices/d1',
          state: { device: mockDevice, home: mockHomeWithDevices, room: mockRoomWithDevices },
        },
      ],
    },
  });
}

function renderWithoutDevice() {
  return render(<DeviceDetail />, {
    routerProps: { initialEntries: [{ pathname: '/devices/d1', state: null }] },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DeviceDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ReactRouter.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useHomes).mockReturnValue(baseHomes);
    vi.mocked(useDevices).mockReturnValue(baseDevices);
    vi.mocked(useValues).mockReturnValue(baseValues);
  });

  it('shows a loader while values are loading', () => {
    vi.mocked(useValues).mockReturnValue({ ...baseValues, loading: true });
    renderWithDevice();
    expect(document.querySelector('[data-mantine-loader]') ?? document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('shows the "Device not found" alert when there is no device in state', () => {
    renderWithoutDevice();
    expect(screen.getByText(/device not found/i)).toBeInTheDocument();
  });

  it('shows a Back to Devices button on the error screen', () => {
    renderWithoutDevice();
    expect(screen.getByRole('button', { name: /back to devices/i })).toBeInTheDocument();
  });

  it('renders the device MAC as the title when device has no name', () => {
    renderWithDevice();
    // mockDevice has no name → falls back to MAC
    expect(screen.getAllByText('AA:BB:CC:DD:EE:FF').length).toBeGreaterThan(0);
  });

  it('renders the device model in the details panel', () => {
    renderWithDevice();
    expect(screen.getByText('Sensor-X')).toBeInTheDocument();
  });

  it('renders the room and home as a location', () => {
    renderWithDevice();
    expect(screen.getByText(/living room/i)).toBeInTheDocument();
    expect(screen.getByText(/my home/i)).toBeInTheDocument();
  });

  it('renders the Back to Devices button', () => {
    renderWithDevice();
    expect(screen.getByRole('button', { name: /back to devices/i })).toBeInTheDocument();
  });

  it('navigates to "/" when Back to Devices is clicked', async () => {
    renderWithDevice();
    await userEvent.click(screen.getByRole('button', { name: /back to devices/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('opens the settings modal when the settings icon is clicked', async () => {
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Device settings'));
    expect(await screen.findByText('Device Settings')).toBeInTheDocument();
  });

  it('closes the settings modal when Cancel is clicked', async () => {
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Device settings'));
    await screen.findByText('Device Settings');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Device Settings')).not.toBeInTheDocument();
    });
  });

  it('opens the delete confirmation modal when the delete icon is clicked', async () => {
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Delete device'));
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('closes the delete modal when Cancel is clicked', async () => {
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Delete device'));
    await screen.findByText('Confirm Deletion');
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
  });

  it('calls deleteDevice and navigates when the Delete button is confirmed', async () => {
    const deleteDevice = vi.fn().mockResolvedValue({});
    vi.mocked(useDevices).mockReturnValue({ ...baseDevices, deleteDevice });
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Delete device'));
    await screen.findByText('Confirm Deletion');
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(deleteDevice).toHaveBeenCalledWith(mockDevice.id));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('renders the sensor section for sensor features', () => {
    renderWithDevice();
    // mockDeviceWithValues has a temperature sensor
    expect(screen.getByRole('heading', { name: /sensors/i })).toBeInTheDocument();
  });

  it('updates the controller switch when toggled (handleControlChange)', async () => {
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      deviceWithValues: {
        ...mockDeviceWithValues,
        features: [
          makeFeatureValue({
            featureUuid: 'ctrl-1',
            name: 'on',
            type: 'controller',
            value: 0,
          }),
        ],
      },
    });
    renderWithDevice();
    const sw = screen.getByRole('switch');
    expect(sw).not.toBeChecked();
    await userEvent.click(sw);
    expect(sw).toBeChecked();
  });

  it('calls assignDeviceHomeRoom and navigates when settings are saved (handleSaveSettings)', async () => {
    const assignDeviceHomeRoom = vi.fn().mockResolvedValue({});
    vi.mocked(useHomes).mockReturnValue({ ...baseHomes, homes: [mockHome] });
    vi.mocked(useDevices).mockReturnValue({ ...baseDevices, assignDeviceHomeRoom });
    renderWithDevice();
    await userEvent.click(screen.getByLabelText('Device settings'));
    await screen.findByText('Device Settings');
    // device.name is '' → falls back to MAC; home + room pre-selected from location state
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    expect(saveButton).not.toBeDisabled();
    await userEvent.click(saveButton);
    await waitFor(() =>
      expect(assignDeviceHomeRoom).toHaveBeenCalledWith(
        'd1',
        'AA:BB:CC:DD:EE:FF',
        'h1',
        'r1',
      ),
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});
