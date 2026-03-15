import { useState } from 'react';
import { login, logout, register } from '../services/authService';

function SellerAuth({ auth, onAuthChange }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      whatsapp: form.whatsapp,
      password: form.password
    };

    const result =
      mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(payload);

    if (!result) {
      setMessage('Unable to authenticate. Check your API and credentials.');
      return;
    }

    onAuthChange(result);
    setMessage('Authenticated successfully.');
  };

  const handleLogout = () => {
    logout();
    onAuthChange(null);
  };

  if (auth?.seller) {
    return (
      <div className="auth-card">
        <div>
          <strong>Signed in as {auth.seller.name}</strong>
          <div className="muted">{auth.seller.email} · {auth.seller.role}</div>
        </div>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-toggle">
        <button
          className={mode === 'login' ? 'toggle active' : 'toggle'}
          type="button"
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          className={mode === 'register' ? 'toggle active' : 'toggle'}
          type="button"
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      {mode === 'register' ? (
        <div className="auth-grid">
          <input name="name" placeholder="Business name" value={form.name} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          <input name="whatsapp" placeholder="WhatsApp" value={form.whatsapp} onChange={handleChange} />
        </div>
      ) : null}

      <div className="auth-grid">
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      </div>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="primary-button" type="submit">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}

export default SellerAuth;
