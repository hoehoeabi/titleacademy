import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../supabase/client';

// Mocks
vi.mock('../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Test Component
const TestComponent = () => {
  const { user, loading, signOut } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'Guest'}</div>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides the current user when session exists', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('calls signOut when the signOut button is clicked', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Sign Out'));
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
