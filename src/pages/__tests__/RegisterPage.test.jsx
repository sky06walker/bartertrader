import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithPopup } from 'firebase/auth';
import RegisterPage from '../RegisterPage';
import { googleProvider, facebookProvider } from '../../firebase';

// Mock the Firebase auth module
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAuth: vi.fn(),
    signInWithPopup: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    sendPasswordResetEmail: vi.fn()
  };
});

// Mock the firebase configuration module
vi.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {},
  facebookProvider: {},
  db: {}
}));

// Mock the useStore hook
vi.mock('../../store/useStore', () => ({
  useStore: () => ({
    saveUserProfile: vi.fn()
  })
}));

describe('RegisterPage Social Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Google and Facebook buttons on Sign Up tab', () => {
    render(<RegisterPage />);
    
    // Check for divider
    expect(screen.getByText('or continue with')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facebook/i })).toBeInTheDocument();
  });

  it('renders Google and Facebook buttons on Sign In tab', () => {
    render(<RegisterPage />);
    
    // Switch to Sign In tab
    fireEvent.click(screen.getByRole('button', { name: 'Sign In', exact: true }));
    
    // Social buttons should still be visible
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Facebook/i })).toBeInTheDocument();
  });

  it('hides social buttons on Forgot Password view', () => {
    render(<RegisterPage />);
    
    // Switch to Sign In tab -> Forgot password
    fireEvent.click(screen.getByRole('button', { name: 'Sign In', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: /Forgot password\?/i }));
    
    // Social buttons should NOT be visible
    expect(screen.queryByText('or continue with')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Google/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Facebook/i })).not.toBeInTheDocument();
  });

  it('calls signInWithPopup with Google provider when Google button is clicked', async () => {
    // Setup mock resolution
    signInWithPopup.mockResolvedValueOnce({ user: { uid: '123' } });
    
    render(<RegisterPage />);
    
    const googleBtn = screen.getByRole('button', { name: /Google/i });
    fireEvent.click(googleBtn);
    
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalledWith(expect.anything(), googleProvider);
  });

  it('calls signInWithPopup with Facebook provider when Facebook button is clicked', async () => {
    // Setup mock resolution
    signInWithPopup.mockResolvedValueOnce({ user: { uid: '123' } });
    
    render(<RegisterPage />);
    
    const facebookBtn = screen.getByRole('button', { name: /Facebook/i });
    fireEvent.click(facebookBtn);
    
    expect(signInWithPopup).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalledWith(expect.anything(), facebookProvider);
  });
});
