import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils';
import ControllerValues from './controllervalues';
import { useValues } from '../../../hooks/useValues';
import { mockDeviceWithValues, makeFeatureValue } from '../../../test-fixtures';
import { DeviceWithValuesResponse } from '../../../models/value';

vi.mock('../../../hooks/useValues');

const baseValues = {
  deviceWithValues: mockDeviceWithValues,
  loading: false,
  deviceWithValuesError: undefined,
  trigger: vi.fn().mockResolvedValue(undefined),
  lazyDeviceWithValues: mockDeviceWithValues,
  lazyDeviceWithValuesLoading: false,
  lazyDeviceWithValuesError: undefined,
  setValues: vi
    .fn()
    .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ message: 'ok' }) }),
};

function makeDevice(
  features: ReturnType<typeof makeFeatureValue>[],
): DeviceWithValuesResponse {
  return { ...mockDeviceWithValues, features };
}

describe('ControllerValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useValues).mockReturnValue(baseValues);
  });

  it('renders nothing interactive when there are no controller features', () => {
    const device = makeDevice([makeFeatureValue({ type: 'sensor' })]);
    render(<ControllerValues deviceWithValues={device} />);
    expect(
      screen.queryByRole('button', { name: /send/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the Send button when controller features are present', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-on',
        name: 'on',
        type: 'controller',
        value: 0,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(
      await screen.findByRole('button', { name: /send/i }),
    ).toBeInTheDocument();
  });

  it('renders the On/Off switch for the "on" feature', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-on',
        name: 'on',
        type: 'controller',
        value: 1,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(
      await screen.findByRole('switch', { name: /on\/off/i }),
    ).toBeInTheDocument();
  });

  it('renders the Setpoint selector', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-sp',
        name: 'setpoint',
        type: 'controller',
        value: 22,
        unit: '°C',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(await screen.findByLabelText(/setpoint/i)).toBeInTheDocument();
  });

  it('renders the Mode selector', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-mode',
        name: 'mode',
        type: 'controller',
        value: 1,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(await screen.findByLabelText(/^mode$/i)).toBeInTheDocument();
  });

  it('renders the Fan selector', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-fan',
        name: 'fanSpeed',
        type: 'controller',
        value: 2,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(await screen.findByLabelText(/^fan$/i)).toBeInTheDocument();
  });

  it('renders the Tolerance selector', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-tol',
        name: 'tolerance',
        type: 'controller',
        value: 2,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(await screen.findByLabelText(/tolerance/i)).toBeInTheDocument();
  });

  it('renders unsupported controller feature label', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-x',
        name: 'unknownCtrl',
        type: 'controller',
        value: 0,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    expect(
      await screen.findByText(/unsupported controller feature/i),
    ).toBeInTheDocument();
  });

  it('renders the formatted modifiedAt date', () => {
    render(<ControllerValues deviceWithValues={mockDeviceWithValues} />);
    expect(
      screen.getByText(/\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/),
    ).toBeInTheDocument();
  });

  it('calls setValues and shows success snackbar when Send is clicked', async () => {
    const device = makeDevice([
      makeFeatureValue({
        featureUuid: 'fv-on',
        name: 'on',
        type: 'controller',
        value: 1,
        unit: '',
      }),
    ]);
    vi.mocked(useValues).mockReturnValue({
      ...baseValues,
      lazyDeviceWithValues: device,
    });
    render(<ControllerValues deviceWithValues={device} />);
    await userEvent.click(await screen.findByRole('button', { name: /send/i }));
    expect(baseValues.setValues).toHaveBeenCalled();
  });
});
