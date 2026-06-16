import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(email, password, name);
    
    if (result.success) {
      navigate('/game');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#87CEEB' }}>
      <div className="w-full max-w-md bg-white border-4 border-black p-8" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
        <h1 className="text-5xl mb-6 text-center" style={{ fontFamily: 'VT323, monospace', color: '#111827' }}>
          WORD EXPLORER
        </h1>
        <h2 className="text-3xl mb-6 text-center" style={{ fontFamily: 'VT323, monospace', color: '#111827' }}>
          REGISTER
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-4 border-black text-red-800" data-testid="register-error">
            <p style={{ fontFamily: 'Fredoka, sans-serif' }}>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Name
            </label>
            <input
              data-testid="register-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border-4 border-black text-lg"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Email
            </label>
            <input
              data-testid="register-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-4 border-black text-lg"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Password
            </label>
            <input
              data-testid="register-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-4 border-black text-lg"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
              required
              minLength="6"
            />
          </div>
          
          <button
            data-testid="register-submit-button"
            type="submit"
            disabled={loading}
            className="w-full p-4 text-2xl font-bold border-4 border-black transition-all"
            style={{
              fontFamily: 'VT323, monospace',
              backgroundColor: '#FFCC00',
              color: '#111827',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,1)';
            }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>
        
        <p className="mt-6 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold underline" style={{ color: '#007AFF' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;