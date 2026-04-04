import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import DeviceCard from './deviceCard';
import { render, screen } from '../../../test-utils';
import { mockDevice } from '../../../test-fixtures';

describe('DeviceCard', () => {
  it('renders the device MAC address', () => {
    render(
      <DeviceCard
        device={mockDevice}
        onShowSettings={vi.fn()}
        onShow={vi.fn()}
      />,
    );
    expect(screen.getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
    expect(screen.getByText(/Sensor-X/)).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
  });

  it('calls onShowSettings when the settings button is clicked', async () => {
    const onShowSettings = vi.fn();
    render(
      <DeviceCard
        device={mockDevice}
        onShowSettings={onShowSettings}
        onShow={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onShowSettings).toHaveBeenCalledWith(mockDevice);
  });

  it('calls onShow when the sensor button is clicked', async () => {
    const onShow = vi.fn();
    render(
      <DeviceCard
        device={mockDevice}
        onShowSettings={vi.fn()}
        onShow={onShow}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /sensor/i }));
    expect(onShow).toHaveBeenCalledWith(mockDevice);
  });
});
