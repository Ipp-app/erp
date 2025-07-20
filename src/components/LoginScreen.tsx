import React, { useState } from 'react';
import { useTheme } from './ui/GlobalUI';
import { useAuth } from '../hooks/useAuth';
import { ThemeSelector } from './common/ThemeSelector';
import ThemedInput from './ui/ThemedInput';
import ThemedButton from './ui/ThemedButton';
import { Zap } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const { currentThemeData } = useTheme();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: `linear-gradient(135deg, ${currentThemeData.bg}, ${currentThemeData.secondary})`,
        color: currentThemeData.text,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <ThemeSelector 
        showDropdown={showThemeDropdown}
        setShowDropdown={setShowThemeDropdown}
        className="absolute top-6 right-6 z-20"
      />
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-xl border shadow-2xl"
        style={{
          background: `${currentThemeData.surface}90`,
          borderColor: currentThemeData.border
        }}
      >
        <div className="flex items-center justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`
            }}
          >
            <Zap size={32} style={{ color: currentThemeData.bg }} />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})` }}>Login ERP</h2>
        <ThemedInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <ThemedInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <ThemedButton type="submit" style={{ width: '100%', marginTop: 12 }}>
          Login
        </ThemedButton>
      </form>
    </div>
  );
};

export default LoginScreen;
