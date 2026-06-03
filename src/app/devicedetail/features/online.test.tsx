import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen } from '../../../test-utils';
import { Online } from './online';
import {
  makeFeatureValue,
  mockOnlineNow,
  mockOnlineOffline,
} from '../../../test-fixtures';
import { useOnline } from '../../../hooks/useOnline';
import { useFeatureNotification } from '../../../hooks/useFeatureNotification';

vi.mock('../../../hooks/useOnline');
vi.mock('../../../hooks/useFeatureNotification');

const deviceId = '68ed0fd57c3ae0cbcae56274';

const onlineFeature = makeFeatureValue({
  name: 'online',
  type: 'sensor',
  enable: true,
  order: 1,
  unit: '-',
  featureUuid: '01fa1af7-4015-4227-a94a-0a4faccfa1a0',
  // not relevant to check online status, because
  // we use online API to determine if a device is online
  createdAt: 0,
  modifiedAt: 0,
});

const baseOnline = {
  online: mockOnlineNow,
  loading: false,
  onlineError: undefined,
};

describe('Online', () => {
  const updateFeatureNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnline).mockReturnValue(baseOnline);
    updateFeatureNotification.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ message: 'feature notification updated' }),
    });
    vi.mocked(useFeatureNotification).mockReturnValue({
      updateFeatureNotification,
      updating: false,
    });
  });

  it('shows a loader while values are loading', () => {
    vi.mocked(useOnline).mockReturnValue({ ...baseOnline, loading: true });
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(
      screen.queryByRole('heading', { name: /online/i }),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when features is empty', () => {
    render(<Online deviceId={deviceId} features={[]} />);
    expect(
      screen.queryByRole('heading', { name: /online/i }),
    ).not.toBeInTheDocument();
    expect(useOnline).toHaveBeenCalledWith(deviceId, { skip: true });
  });

  it('loads online status when an online feature exists', () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(useOnline).toHaveBeenCalledWith(deviceId, { skip: false });
  });

  it('renders the Online heading', () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /online/i }),
    ).toBeInTheDocument();
  });

  it('renders the feature name', () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('shows "Online" when online value API has modDate >= currentDate - 60 seconds', () => {
    // to have this scenario we use the mocked mockOnlineNow to be sure that it always true
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(screen.getAllByText('Online')).toHaveLength(2);
  });

  it('shows "Offline" when online value API has modDate < currentDate - 60 seconds', () => {
    // to have this scenario we need to mock mockOnlineOffline to be sure that it always false
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      online: mockOnlineOffline,
    });
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows "Unknown" when online value API fails', () => {
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      online: undefined,
      onlineError: { status: 500, data: { error: 'Cannot get online' } },
    });

    render(<Online deviceId={deviceId} features={[onlineFeature]} />);

    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('Status not available')).toBeInTheDocument();
  });

  it('shows "Unknown" when online data is missing', () => {
    vi.mocked(useOnline).mockReturnValue({
      ...baseOnline,
      online: undefined,
    });

    render(<Online deviceId={deviceId} features={[onlineFeature]} />);

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('renders notification silence from the feature preference', () => {
    render(
      <Online
        deviceId={deviceId}
        features={[{ ...onlineFeature, notificationSilenced: true }]}
      />,
    );

    expect(
      screen.getByRole('button', { name: /enable notifications/i }),
    ).toBeInTheDocument();
  });

  it('updates notification silence when toggled', async () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);

    await userEvent.click(
      screen.getByRole('button', { name: /silence notifications/i }),
    );

    expect(updateFeatureNotification).toHaveBeenCalledWith(
      deviceId,
      onlineFeature.featureUuid,
      true,
    );
  });
});
