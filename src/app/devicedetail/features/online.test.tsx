import { describe, it, expect, beforeEach, vi } from 'vitest';

import { render, screen } from '../../../test-utils';
import { Online } from './online';
import {
  makeFeatureValue,
  mockOnlineNow,
  mockOnlineOffline,
} from '../../../test-fixtures';
import { useOnline } from '../../../hooks/useOnline';

vi.mock('../../../hooks/useOnline');

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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnline).mockReturnValue(baseOnline);
  });

  it('shows a loader while values are loading', () => {
    vi.mocked(useOnline).mockReturnValue({ ...baseOnline, loading: true });
    expect(
      screen.queryByRole('heading', { name: /online/i }),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when features is empty', () => {
    render(<Online deviceId={deviceId} features={[]} />);
    expect(
      screen.queryByRole('heading', { name: /online/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the Online heading', () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(
      screen.getByRole('heading', { name: /online/i }),
    ).toBeInTheDocument();
  });

  it('renders the feature name', () => {
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('shows "Online" when online value API has modDate >= currentDate - 60 seconds', () => {
    // to have this scenario we use the mocked mockOnlineNow to be sure that it always true
    render(<Online deviceId={deviceId} features={[onlineFeature]} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
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
});
