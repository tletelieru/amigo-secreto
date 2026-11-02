import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { createGroupToken } from './lib/groupLink';
import { createToken } from './lib/link';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const google = vi.hoisted(() => ({ signIn: null as unknown as (email: string | null) => void }));

vi.mock('./lib/google', () => ({
  googleClientId: () => 'test-client',
  renderGoogleButton: async (
    _parent: HTMLElement,
    options: { onEmail: (email: string | null) => void },
  ) => {
    google.signIn = options.onEmail;
  },
}));

const ticket = {
  giver: 'Ana',
  receiver: 'Ben',
  event: { name: 'Navidad', date: '2026-12-24', amount: '$20.000', note: 'En casa' },
};

function addPeople(...names: string[]) {
  const input = screen.getByRole('textbox', { name: 'Name' });
  for (const name of names) {
    fireEvent.change(input, { target: { value: name } });
    fireEvent.keyDown(input, { key: 'Enter' });
  }
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
  localStorage.setItem('preferred-lang', 'en');
  localStorage.setItem('color-mode', 'light');
});

afterEach(cleanup);

describe('App', () => {
  it('credits the developer in the footer', () => {
    render(<App />);
    const footer = within(screen.getByRole('contentinfo'));
    expect(footer.getByRole('link', { name: 'tletelieru' })).toBeTruthy();
  });

  it('switches language and remembers it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ES' }));
    expect(screen.getByRole('heading', { name: 'Sortea y guarda el secreto' })).toBeTruthy();
    expect(localStorage.getItem('preferred-lang')).toBe('es');
  });

  it('toggles color mode and remembers it', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(localStorage.getItem('color-mode')).toBe('dark');
  });

  it('blocks the draw until there are enough people', () => {
    render(<App />);
    const draw = screen.getByRole('button', { name: 'Draw names' }) as HTMLButtonElement;
    expect(draw.disabled).toBe(true);
    addPeople('Ana', 'Ben');
    expect(draw.disabled).toBe(true);
    addPeople('Cami');
    expect(draw.disabled).toBe(false);
  });

  it('flags a duplicate name', () => {
    render(<App />);
    addPeople('Ana');
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'ana' } });
    expect(screen.getByText('That name is already on the list.')).toBeTruthy();
  });

  it('draws without ever showing a match, and keeps it after a reload', async () => {
    const { unmount } = render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    fireEvent.click(screen.getByRole('button', { name: 'Draw names' }));
    await screen.findByRole('heading', { name: 'Send the links' });
    expect(screen.queryByText(/giving a gift/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Copy link: Ben' })).toBeTruthy();
    unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Send the links' })).toBeTruthy();
  });

  it('tracks sent links locally', async () => {
    render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    fireEvent.click(screen.getByRole('button', { name: 'Draw names' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Sent: Ben' }));
    await waitFor(() => expect(screen.getByText('1 of 3 sent')).toBeTruthy());
  });

  it('goes back to editing after confirming a redo', async () => {
    render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    fireEvent.click(screen.getByRole('button', { name: 'Draw names' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Redo the draw' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Redo the draw' }));
    expect(await screen.findByRole('button', { name: 'Draw names' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove Ana' })).toBeTruthy();
  });

  it('saves a list and loads it into a new group', async () => {
    render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    fireEvent.change(screen.getByRole('textbox', { name: 'List name' }), {
      target: { value: 'Family' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save list' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load list Family' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Load list' }));
    expect(await screen.findByRole('button', { name: 'Remove Ana' })).toBeTruthy();
  });

  it('offers one group link once everyone has an email', async () => {
    render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    for (const name of ['Ana', 'Ben', 'Cami']) {
      fireEvent.change(screen.getByRole('textbox', { name: `Google email for ${name}` }), {
        target: { value: `${name.toLowerCase()}@gmail.com` },
      });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Draw names' }));
    expect(await screen.findByRole('heading', { name: 'One link for everyone' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Copy link: Ben' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show individual links' }));
    expect(screen.getByRole('button', { name: 'Copy link: Ben' })).toBeTruthy();
  });

  it('skips the group link when an email is missing', async () => {
    render(<App />);
    addPeople('Ana', 'Ben', 'Cami');
    fireEvent.click(screen.getByRole('button', { name: 'Draw names' }));
    await screen.findByRole('heading', { name: 'Send the links' });
    expect(screen.queryByRole('heading', { name: 'One link for everyone' })).toBeNull();
  });

  it('shows the group link result only to its Google account', async () => {
    const token = await createGroupToken(ticket.event, [
      { email: 'ana@gmail.com', giver: 'Ana', receiver: 'Ben' },
      { email: 'ben@gmail.com', giver: 'Ben', receiver: 'Ana' },
    ]);
    history.replaceState(null, '', `/#g=${token}`);
    render(<App />);
    await screen.findByRole('heading', { name: 'Navidad' });
    await waitFor(() => expect(screen.getByText(/Sign in with Google/)).toBeTruthy());
    await act(async () => google.signIn('otra@gmail.com'));
    expect(await screen.findByText(/otra@gmail.com is not in this group/)).toBeTruthy();
    await act(async () => google.signIn('ana@gmail.com'));
    expect(await screen.findByRole('heading', { name: 'Hi Ana!' })).toBeTruthy();
    expect(screen.queryByText('Ben')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open the envelope' }));
    expect(await screen.findByText('Ben')).toBeTruthy();
  });

  it('hides the match on a private link until it is opened', async () => {
    history.replaceState(null, '', `/#r=${await createToken(ticket)}`);
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Hi Ana!' })).toBeTruthy();
    expect(screen.queryByText('Ben')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open the envelope' }));
    expect(await screen.findByText('Ben')).toBeTruthy();
    expect(screen.getByText('$20.000')).toBeTruthy();
  });

  it('leaves the saved group alone on a private link', async () => {
    history.replaceState(null, '', `/#r=${await createToken(ticket)}`);
    render(<App />);
    await screen.findByRole('heading', { name: 'Hi Ana!' });
    expect(localStorage.getItem('as-group')).toBeNull();
  });

  it('explains a broken link', async () => {
    history.replaceState(null, '', '/#r=abc.def');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'This link does not work' })).toBeTruthy();
  });
});
