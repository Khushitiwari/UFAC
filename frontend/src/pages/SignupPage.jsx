import { useCallback, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { signupSchema } from '../validators/auth.schema.js';
import AuthLayout, { AuthFooterLink } from '../components/common/AuthLayout.jsx';
import Button from '../components/common/Button.jsx';

const ROLE_OPTIONS = [
  {
    value: 'ACCOUNTANT',
    label: 'Accountant',
    description: 'Create records, post transactions, and view reports',
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Full access including master data and user management',
  },
];

const SignupPage = () => {
  const { signup, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ACCOUNTANT',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setErrors({});
      const result = signupSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          const key = err.path[0];
          if (!fieldErrors[key]) fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      try {
        await signup(form);
        navigate('/');
      } catch (err) {
        setErrors({ form: err.response?.data?.error || 'Registration failed' });
      }
    },
    [form, signup, navigate],
  );

  if (isAuthenticated) return <Navigate to="/" replace />;

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === form.role);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Choose your role and set up access to UFAC"
      footer={<AuthFooterLink to="/login">Already have an account?</AuthFooterLink>}
    >
      {errors.form && <div className="alert-error">{errors.form}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Accountant"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@company.com"
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedRole && <p className="field-hint">{selectedRole.description}</p>}
          {errors.role && <div className="form-error">{errors.role}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
          {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
        </div>
        <Button type="submit" disabled={loading} className="btn-block">
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <p className="auth-hint">
        Contact portal users (vendors/customers) are created by an admin and linked to a contact record.
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
