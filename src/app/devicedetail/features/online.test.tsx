import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test-utils';
import { Online } from './online';
import { makeFeatureValue } from '../../../test-fixtures';

const onlineFeature = makeFeatureValue({ name: 'online', type: 'sensor', value: 1 });

describe('Online', () => {
  it('renders nothing when features is empty', () => {
    render(<Online features={[]} />);
    expect(screen.queryByRole('heading', { name: /presence/i })).not.toBeInTheDocument();
  });

  it('renders the Presence heading', () => {
    render(<Online features={[onlineFeature]} />);
    expect(screen.getByRole('heading', { name: /presence/i })).toBeInTheDocument();
  });

  it('renders the feature name', () => {
    render(<Online features={[onlineFeature]} />);
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('shows "Present" when value is 1', () => {
    render(<Online features={[makeFeatureValue({ name: 'online', type: 'sensor', value: 1 })]} />);
    expect(screen.getByText('Present')).toBeInTheDocument();
  });

  it('shows "Absent" when value is 0', () => {
    render(<Online features={[makeFeatureValue({ name: 'online', type: 'sensor', value: 0 })]} />);
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });

  it('renders a card for each feature', () => {
    const features = [
      makeFeatureValue({ featureUuid: 'f1', name: 'online', type: 'sensor', value: 1 }),
      makeFeatureValue({ featureUuid: 'f2', name: 'online', type: 'sensor', value: 0 }),
    ];
    render(<Online features={features} />);
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
  });
});
