import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import HomeCard from './homeCard';
import { render, screen } from '../../../test-utils';
import { mockHome } from '../../../test-fixtures';

describe('HomeCard', () => {
  it('renders the home name and location', async () => {
    render(<HomeCard home={mockHome} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('My Home')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show rooms/i }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show rooms/i }));
    expect(screen.getByText(/Living Room/)).toBeInTheDocument();
  });

  it('calls onEdit with the home when the edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<HomeCard home={mockHome} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockHome);
  });

  it('calls onDelete with the home when the delete button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<HomeCard home={mockHome} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(mockHome);
  });
});
