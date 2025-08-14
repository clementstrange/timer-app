import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { AuthForm } from './App';
import { useTheme } from './ThemeContext';
import { ThemeToggle } from './ThemeToggle';

// Reuse the same styles from the modal for consistency
const getContainerStyle = (colors: any) => ({
  display: "flex",
  flexDirection: "column" as const,
  minHeight: "100vh",
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
  padding: "10px" // Reduced padding for mobile
});

const getCardStyle = (colors: any) => ({
  backgroundColor: colors.surface,
  padding: "20px", // Reduced from 40px for mobile
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: `0 10px 30px ${colors.shadow}`,
  margin: "10px", // Added margin for mobile spacing
  boxSizing: "border-box" as const // Ensure padding doesn't overflow
});

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px"
};

const getInputStyle = (colors: any) => ({
  width: "100%",
  padding: "15px",
  fontSize: "16px",
  borderRadius: "8px",
  border: `2px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.text + ' !important',
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
  WebkitTextFillColor: colors.text // For Safari autofill override
});

const buttonStyle = {
  padding: "15px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.2s",
  minWidth: "80px"
};

const getPrimaryButtonStyle = (colors: any) => ({
  ...buttonStyle,
  backgroundColor: colors.primary,
  color: "white"
});

const getSecondaryButtonStyle = (colors: any) => ({
  ...buttonStyle,
  backgroundColor: colors.secondary,
  color: "white"
});

const getLinkStyle = (colors: any) => ({
  color: colors.primary,
  textDecoration: "none",
  fontSize: "14px",
  textAlign: "center" as const,
  marginTop: "10px"
});

const getTitleStyle = (colors: any) => ({
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "30px",
  color: colors.text
});

export default function Login() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    email: '',
    password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  async function signUp() {
    // Basic client-side validation
    if (!authForm.email || !authForm.password || !authForm.name) {
      alert('Please fill in all fields');
      return;
    }
    
    if (authForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: {
        data: {
          name: authForm.name
        }
      }
    });
    
    setIsLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to confirm your account!');
      navigate('/');
    }
  }

  async function signIn() {
    // Basic client-side validation
    if (!authForm.email || !authForm.password) {
      alert('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authForm.email,
      password: authForm.password
    });
    
    setIsLoading(false);
    if (error) {
      alert(error.message);
    } else {
      navigate('/');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSignUp) {
        signUp();
      } else {
        signIn();
      }
    }
  };

  // Dynamic styles based on screen size
  const responsiveCardStyle = {
    ...getCardStyle(colors),
    padding: isMobile ? "15px" : "30px",
    margin: isMobile ? "5px" : "20px"
  };

  const responsiveContainerStyle = {
    ...getContainerStyle(colors),
    padding: isMobile ? "5px" : "20px"
  };

  return (
    <div style={responsiveContainerStyle}>
      {/* Theme toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>
      
      <div style={responsiveCardStyle}>
        <h1 style={getTitleStyle(colors)}>
          🍅 Life in Focus
        </h1>
        
        {/* <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          {isSignUp ? 'Create Account' : 'Sign in'}
        </h2> */}
        
        <div style={formStyle}>
          {isSignUp && (
            <input
              style={getInputStyle(colors)}
              placeholder="Full Name"
              type="text"
              value={authForm.name}
              onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
              onKeyDown={handleKeyDown}
              autoComplete="name"
            />
          )}
          
          <input
            style={getInputStyle(colors)}
            placeholder="Email"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
          
          <input
            style={getInputStyle(colors)}
            placeholder="Password"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            onKeyDown={handleKeyDown}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          
          <button 
            style={getPrimaryButtonStyle(colors)}
            onClick={isSignUp ? signUp : signIn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          <button 
            style={getSecondaryButtonStyle(colors)}
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          
          <Link to="/" style={getLinkStyle(colors)}>
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}