import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test-utils';
import SensorValue from './sensorvalue';
import { makeFeatureValue } from '../../../test-fixtures';

// OnlineValue uses useOnline hook — mock it to avoid RTK Query dependency
vi.mock('../../../hooks/useOnline', () => ({
  useOnline: vi.fn(() => ({
    online: {
      modifiedAt: new Date().toISOString(),
      currentTime: new Date().toISOString(),
      createdAt: '',
    },
    loading: false,
    onlineError: undefined,
  })),
}));

describe('SensorValue', () => {
  it('renders a temperature sensor with value and unit', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({
          name: 'temperature',
          value: 22.5,
          unit: '°C',
        })}
      />,
    );
    expect(screen.getByText('TEMPERATURE')).toBeInTheDocument();
    expect(screen.getByText(/22\.50/)).toBeInTheDocument();
    expect(screen.getByText(/°C/)).toBeInTheDocument();
  });

  it('renders a humidity sensor', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({ name: 'humidity', value: 60.1, unit: '%' })}
      />,
    );
    expect(screen.getByText('HUMIDITY')).toBeInTheDocument();
    expect(screen.getByText(/60\.10/)).toBeInTheDocument();
  });

  it('renders a light sensor', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({ name: 'light', value: 300, unit: 'lux' })}
      />,
    );
    expect(screen.getByText('LIGHT')).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it('renders a motion sensor as True when value is 1', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({ name: 'motion', value: 1, unit: '' })}
      />,
    );
    expect(screen.getByText('MOTION')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
  });

  it('renders a motion sensor as False when value is 0', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({ name: 'motion', value: 0, unit: '' })}
      />,
    );
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  it('renders airquality levels correctly', () => {
    const cases: [number, string][] = [
      [0, 'Extreme pollution'],
      [1, 'High pollution'],
      [2, 'Mid pollution'],
      [3, 'Low pollution'],
    ];
    for (const [value, label] of cases) {
      const { unmount } = render(
        <SensorValue
          id="d1"
          feature={makeFeatureValue({ name: 'airquality', value, unit: '' })}
        />,
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('renders airpressure sensor', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({
          name: 'airpressure',
          value: 1013,
          unit: 'hPa',
        })}
      />,
    );
    expect(screen.getByText('AIRPRESSURE')).toBeInTheDocument();
    expect(screen.getByText(/1013/)).toBeInTheDocument();
  });

  it('renders online sensor', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({
          name: 'online',
          value: 1,
          unit: '',
          modifiedAt: 0,
        })}
      />,
    );
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    // OnlineValue renders a status text; there are multiple /online/i matches (heading + status)
    expect(screen.getAllByText(/online/i).length).toBeGreaterThan(1);
  });

  it('renders unsupported sensor type label', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({
          name: 'unknown_sensor',
          value: 0,
          unit: '',
        })}
      />,
    );
    expect(screen.getByText(/unsupported feature/i)).toBeInTheDocument();
  });

  it('renders the formatted last-modified date when modifiedAt > 0', () => {
    render(
      <SensorValue
        id="d1"
        feature={makeFeatureValue({
          name: 'temperature',
          value: 20,
          modifiedAt: 1705318245000,
        })}
      />,
    );
    // date is rendered as HH:MM:SS DD/MM/YYYY
    expect(
      screen.getByText(/\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/),
    ).toBeInTheDocument();
  });
});
