import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { AuthForm } from './App';

// Reuse the same styles from the modal for consistency
const containerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  minHeight: "100vh",
  backgroundColor: "#e9ecef",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const cardStyle = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
};

const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "20px"
};

const inputStyle = {
  width: "100%",
  padding: "15px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "2px solid #ddd",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const
};

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

const primaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#007bff",
  color: "white"
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6c757d",
  color: "white"
};

const linkStyle = {
  color: "#007bff",
  textDecoration: "none",
  fontSize: "14px",
  textAlign: "center" as const,
  marginTop: "10px"
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  marginBottom: "30px",
  color: "#333"
};

export default function Login() {
  const navigate = useNavigate();
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    email: '',
    password: ''
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>
          🍅 Life in Focus
        </h1>
        
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <div style={formStyle}>
          {isSignUp && (
            <input
              style={inputStyle}
              placeholder="Full Name"
              type="text"
              value={authForm.name}
              onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
              onKeyDown={handleKeyDown}
              autoComplete="name"
            />
          )}
          
          <input
            style={inputStyle}
            placeholder="Email"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
            onKeyDown={handleKeyDown}
            autoComplete="email"
          />
          
          <input
            style={inputStyle}
            placeholder="Password"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            onKeyDown={handleKeyDown}
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          
          <button 
            style={primaryButtonStyle}
            onClick={isSignUp ? signUp : signIn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          <button 
            style={secondaryButtonStyle}
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          
          <Link to="/" style={linkStyle}>
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}