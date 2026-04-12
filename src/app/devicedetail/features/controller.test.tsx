import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils';
import { ControllerFeature } from './controller';
import { makeFeatureValue } from '../../../test-fixtures';

const baseProps = {
  lastSent: '2024-01-01T00:00:00Z',
  onChangeValue: vi.fn(),
  onSend: vi.fn(),
  isSending: false,
};

describe('ControllerFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when features is empty', () => {
    render(<ControllerFeature {...baseProps} features={[]} />);
    expect(screen.queryByRole('heading', { name: /controls/i })).not.toBeInTheDocument();
  });

  it('renders the Controls heading', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('heading', { name: /controls/i })).toBeInTheDocument();
  });

  it('renders the Send Commands button', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('button', { name: /send commands/i })).toBeInTheDocument();
  });

  it('calls onSend when Send Commands is clicked', async () => {
    const onSend = vi.fn();
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} onSend={onSend} features={features} />);
    await userEvent.click(screen.getByRole('button', { name: /send commands/i }));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('disables Send Commands button while sending', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} isSending={true} features={features} />);
    expect(screen.getByRole('button', { name: /send commands/i })).toBeDisabled();
  });

  it('renders a switch for the "on" feature', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('shows "On" label when on=1', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('shows "Off" label when on=0', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 0 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('renders a slider for the "setpoint" feature', () => {
    const features = [makeFeatureValue({ name: 'setpoint', type: 'controller', value: 22 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
  });

  it('renders a slider for the "tolerance" feature', () => {
    const features = [makeFeatureValue({ name: 'tolerance', type: 'controller', value: 3 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders a select for the "mode" feature', () => {
    const features = [makeFeatureValue({ name: 'mode', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders a select for the "fanSpeed" feature', () => {
    const features = [makeFeatureValue({ name: 'fanSpeed', type: 'controller', value: 2 })];
    render(<ControllerFeature {...baseProps} features={features} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows the last command sent info', () => {
    const features = [makeFeatureValue({ name: 'on', type: 'controller', value: 1 })];
    render(<ControllerFeature {...baseProps} lastSent="2024-01-01T00:00:00Z" features={features} />);
    expect(screen.getByText(/last command sent/i)).toBeInTheDocument();
  });

  it('calls onChangeValue when the Switch is toggled', async () => {
    const onChangeValue = vi.fn();
    const features = [makeFeatureValue({ featureUuid: 'ctrl-1', name: 'on', type: 'controller', value: 0 })];
    render(<ControllerFeature {...baseProps} onChangeValue={onChangeValue} features={features} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChangeValue).toHaveBeenCalledWith('ctrl-1', 1);
  });
});