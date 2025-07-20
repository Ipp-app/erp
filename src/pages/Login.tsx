import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ThemedButton from '../components/ui/ThemedButton';
import ThemedInput from '../components/ui/ThemedInput';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = '/';
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-8 rounded shadow-md w-80" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <ThemedInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <ThemedInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <ThemedButton
          className="w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </ThemedButton>
      </form>
    </div>
  );
}