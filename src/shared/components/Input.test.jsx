import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders label correctly', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('updates value on change', () => {
    render(<Input label="Test Input" placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here');
    
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input.value).toBe('Hello World');
  });
});
