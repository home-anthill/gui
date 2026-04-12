import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Accordion } from '@mantine/core';
import { render, screen } from '../../../test-utils';
import { HomeAccordion } from './home';
import { HomesActionsContext } from '../HomesActionsContext';
import { mockHome, mockHomeNoRooms } from '../../../test-fixtures';

const mockActions = {
  onEditHome: vi.fn(),
  onDeleteHome: vi.fn(),
  onAddRoom: vi.fn(),
  onEditRoom: vi.fn(),
  onDeleteRoom: vi.fn(),
};

function renderHomeAccordion(home: typeof mockHome) {
  return render(
    <HomesActionsContext.Provider value={mockActions}>
      <Accordion>
        <HomeAccordion home={home} />
      </Accordion>
    </HomesActionsContext.Provider>,
  );
}

describe('HomeAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the home name and location', () => {
    renderHomeAccordion(mockHome);
    expect(screen.getByText('My Home')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('calls onEditHome when the edit button is clicked', async () => {
    renderHomeAccordion(mockHome);
    await userEvent.click(screen.getByRole('button', { name: /edit home/i }));
    expect(mockActions.onEditHome).toHaveBeenCalledWith('h1');
  });

  it('calls onDeleteHome when the delete button is clicked', async () => {
    renderHomeAccordion(mockHome);
    await userEvent.click(screen.getByRole('button', { name: /delete home/i }));
    expect(mockActions.onDeleteHome).toHaveBeenCalledWith('h1');
  });

  it('shows room names when the accordion is expanded', async () => {
    renderHomeAccordion(mockHome);
    await userEvent.click(screen.getByRole('button', { name: /my home/i }));
    expect(await screen.findByText('Living Room')).toBeInTheDocument();
  });

  it('shows "No rooms configured" when the home has no rooms', async () => {
    renderHomeAccordion(mockHomeNoRooms);
    await userEvent.click(screen.getByRole('button', { name: /empty home/i }));
    expect(await screen.findByText(/no rooms configured/i)).toBeInTheDocument();
  });

  it('calls onAddRoom when Add Room is clicked', async () => {
    renderHomeAccordion(mockHome);
    await userEvent.click(screen.getByRole('button', { name: /my home/i }));
    await userEvent.click(await screen.findByRole('button', { name: /add room/i }));
    expect(mockActions.onAddRoom).toHaveBeenCalledWith('h1');
  });
});
