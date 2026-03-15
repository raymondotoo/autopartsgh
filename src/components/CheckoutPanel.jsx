import { useState } from 'react';
import { initializePayment } from '../services/paymentsService';

function CheckoutPanel({ part, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!part) return null;

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    if (!form.name || !form.email || !form.phone) {
      setMessage('Please fill all fields.');
      return;
    }

    setLoading(true);
    const result = await initializePayment({
      partId: part.id,
      buyerName: form.name,
      buyerEmail: form.email,
      buyerPhone: form.phone
    });
    setLoading(false);

    if (!result?.paymentLink) {
      setMessage('Payment could not be initialized. Check backend config.');
      return;
    }

    window.location.href = result.paymentLink;
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-panel">
        <div className="checkout-header">
          <h3>Complete purchase</h3>
          <button className="ghost-button" type="button" onClick={onClose}>Close</button>
        </div>
        <p className="muted">{part.name} · {part.price}</p>
        <form onSubmit={handleSubmit} className="checkout-form">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Redirecting...' : 'Proceed to payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPanel;
