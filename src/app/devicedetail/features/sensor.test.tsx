import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { makeFeatureValue } from '../../../test-fixtures';
import { useFeatureNotification } from '../../../hooks/useFeatureNotification';

import { Sensor } from './sensor';

vi.mock('../../../hooks/useFeatureNotification');

const deviceId = 'device-id';

describe('Sensor', () => {
  const updateFeatureNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    updateFeatureNotification.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        message: 'feature notification updated',
      }),
    });
    vi.mocked(useFeatureNotification).mockReturnValue({
      updateFeatureNotification,
      updating: false,
    });
  });

  it('renders nothing when features is empty', () => {
    render(<Sensor deviceId={deviceId} features={[]} />);
    expect(screen.queryByRole('heading', { name: /sensors/i })).not.toBeInTheDocument();
  });

  it('renders the Sensors heading', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue()]} />);
    expect(screen.getByRole('heading', { name: /sensors/i })).toBeInTheDocument();
  });

  it('renders the feature name', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'temperature' })]} />);
    expect(screen.getByText('temperature')).toBeInTheDocument();
  });

  it('formats temperature with two decimals and shows the unit', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'temperature', value: 22.5, unit: '°C' })]} />);
    expect(screen.getByText('22.50')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('formats humidity with two decimals', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'humidity', value: 65.7, unit: '%' })]} />);
    expect(screen.getByText('65.70')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('formats values with two decimals when the feature step is smaller than 0.01', () => {
    render(
      <Sensor
        deviceId={deviceId}
        features={[
          makeFeatureValue({
            name: 'temperature',
            value: 12.3456,
            spec: { format: 'float', step: 0.001 },
          }),
        ]}
      />,
    );
    expect(screen.getByText('12.35')).toBeInTheDocument();
  });

  it('shows "Detected" for motion when value is truthy', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'motion', value: 1, unit: '-' })]} />);
    expect(screen.getByText('Detected')).toBeInTheDocument();
  });

  it('shows "None" for motion when value is 0', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'motion', value: 0, unit: '-' })]} />);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it.each(['motion', 'mode'])(
    'renders the notification control for %s',
    (name) => {
      render(
        <Sensor
          deviceId={deviceId}
          features={[makeFeatureValue({ name })]}
        />,
      );

      expect(
        screen.getByRole('button', { name: /silence notifications/i }),
      ).toBeInTheDocument();
    },
  );

  it('does not render the notification control for other sensors', () => {
    render(
      <Sensor
        deviceId={deviceId}
        features={[makeFeatureValue({ name: 'temperature' })]}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /notifications/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the saved notification preference and updates it', async () => {
    const motion = makeFeatureValue({
      featureUuid: 'motion-feature',
      name: 'motion',
      notificationSilenced: true,
    });
    render(<Sensor deviceId={deviceId} features={[motion]} />);

    await userEvent.click(
      screen.getByRole('button', { name: /enable notifications/i }),
    );

    expect(updateFeatureNotification).toHaveBeenCalledWith(
      deviceId,
      motion.featureUuid,
      false,
    );
  });

  it('shows the air quality label and index', () => {
    // value 2 → 'Good'
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'airquality', value: 2, unit: '-' })]} />);
    expect(screen.getByText(/good/i)).toBeInTheDocument();
  });

  it('shows "Unknown" for out-of-range air quality', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'airquality', value: 99, unit: '-' })]} />);
    expect(screen.getByText(/unknown/i)).toBeInTheDocument();
  });

  it('does not render the unit when unit is "-"', () => {
    render(<Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'motion', value: 0, unit: '-' })]} />);
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });

  it.each([
    [-1.0, 'Error'],
    [0.0, 'Sleep'],
    [1.0, 'Cold'],
    [2.0, 'Heat'],
  ])('renders the mode value %i as a %s icon', (value, label) => {
    render(
      <Sensor
        deviceId={deviceId}
        features={[
          makeFeatureValue({
            name: 'mode',
            value,
            unit: '-',
            spec: { format: 'float', step: 1.0 },
          }),
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: label })).toBeInTheDocument();
    expect(screen.queryByText(String(value))).not.toBeInTheDocument();
  });

  it('does not map a mode value outside the admitted float values to an icon', () => {
    render(
      <Sensor
        deviceId={deviceId}
        features={[
          makeFeatureValue({
            name: 'mode',
            value: 3.0,
            unit: '-',
            spec: { format: 'float', step: 1.0 },
          }),
        ]}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders a temperature status icon for the thermostat mode sensor', () => {
    const { container } = render(
      <Sensor deviceId={deviceId} features={[makeFeatureValue({ name: 'mode', value: 1 })]} />,
    );

    expect(
      container.querySelector('.tabler-icon-temperature'),
    ).toBeInTheDocument();
  });

  it('renders a card for each feature', () => {
    const features = [
      makeFeatureValue({
        featureUuid: 'f1',
        name: 'temperature',
        value: 20,
        unit: '°C',
      }),
      makeFeatureValue({
        featureUuid: 'f2',
        name: 'humidity',
        value: 50,
        unit: '%',
      }),
      makeFeatureValue({
        featureUuid: 'f3',
        name: 'light',
        value: 1200,
        unit: 'lux',
      }),
    ];
    render(<Sensor deviceId={deviceId} features={features} />);
    expect(screen.getByText('temperature')).toBeInTheDocument();
    expect(screen.getByText('humidity')).toBeInTheDocument();
    expect(screen.getByText('light')).toBeInTheDocument();
  });
});
