import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginSchema } from '../validators/contact.schema.js';
import Button from '../components/common/Button.jsx';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');
      const result = loginSchema.safeParse(form);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
      try {
        await login(form);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
      }
    },
    [form, login, navigate],
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">UF</div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to Urban Furniture Accounting</p>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@ufac.local"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="btn-block">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
