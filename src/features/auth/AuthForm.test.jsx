import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthForm } from './AuthForm';
import { supabase } from '../../shared/supabase/client';
import { useMessage } from '../../shared/contexts/MessageContext';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock('../../shared/contexts/MessageContext', () => ({
  useMessage: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('AuthForm Component', () => {
  const mockShowMessage = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useMessage.mockReturnValue({ showMessage: mockShowMessage });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders sign-in mode by default', () => {
    render(<AuthForm />);
    expect(screen.getByText('Coffee Time ☕️')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카페 입장하기' })).toBeInTheDocument();
  });

  it('switches to sign-up mode when the toggle button is clicked', () => {
    render(<AuthForm />);
    const toggleButton = screen.getByText(/멤버십이 없으신가요\? 회원가입/i);
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Welcome to Cold Drip ☕️')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
  });

  it('shows error message when passwords do not match in sign-up mode', async () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText(/멤버십이 없으신가요\? 회원가입/i));

    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'Different123!' } });
    fireEvent.change(screen.getByLabelText('활동 닉네임'), { target: { value: 'tester' } });

    fireEvent.click(screen.getByRole('button', { name: '콜드드립 멤버 되기' }));

    expect(mockShowMessage).toHaveBeenCalledWith('비밀번호가 서로 일치하지 않습니다. 다시 확인해 주세요.');
  });

  it('calls supabase.auth.signInWithPassword on sign-in', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    render(<AuthForm />);
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'login@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: '카페 입장하기' }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'login@example.com',
        password: 'password',
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
