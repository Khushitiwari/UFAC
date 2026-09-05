import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { loginSchema } from '../validators/auth.schema.js';
import AuthLayout, { AuthFooterLink } from '../components/common/AuthLayout.jsx';
import Button from '../components/common/Button.jsx';

const LoginPage = () => {
  const { login, loading, isAuthenticated } = useAuth();
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

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your accounting workspace"
      footer={<AuthFooterLink to="/signup">New here?</AuthFooterLink>}
    >
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="admin@ufac.local"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <Button type="submit" disabled={loading} className="btn-block">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="auth-hint">Demo: admin@ufac.local / Admin123!</p>
    </AuthLayout>
  );
};

export default LoginPage;
