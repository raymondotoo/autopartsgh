import { useEffect, useState } from 'react';
import { approveListing, getPendingListings, rejectListing } from '../services/partsService';

function AdminPanel({ token }) {
  const [listings, setListings] = useState([]);
  const [message, setMessage] = useState('');

  const loadListings = async () => {
    const data = await getPendingListings(token);
    setListings(data || []);
  };

  useEffect(() => {
    if (!token) return;
    loadListings();
  }, [token]);

  const handleAction = async (id, action) => {
    setMessage('');
    if (action === 'approve') await approveListing(id, token);
    if (action === 'reject') await rejectListing(id, token);
    setMessage(`Listing ${action}d.`);
    loadListings();
  };

  if (!token) {
    return (
      <div className="empty-state">
        <p>Admin access requires a signed-in admin account.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="results-header">
        <h3>Pending listings</h3>
        <span>{listings.length} waiting</span>
      </div>
      {message ? <p className="form-message">{message}</p> : null}
      <div className="admin-list">
        {listings.length === 0 ? (
          <div className="empty-state">
            <p>No pending listings right now.</p>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="admin-card">
              <div>
                <strong>{listing.name}</strong>
                <div className="muted">{listing.car?.make} {listing.car?.model} {listing.car?.year}</div>
                <div className="muted">Seller: {listing.seller?.name}</div>
              </div>
              <div className="admin-actions">
                <button className="tiny-button" type="button" onClick={() => handleAction(listing.id, 'approve')}>
                  Approve
                </button>
                <button className="ghost-button" type="button" onClick={() => handleAction(listing.id, 'reject')}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
