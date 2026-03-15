import { useEffect, useState } from 'react';
import { getMyListings } from '../services/partsService';

function SellerDashboard({ token }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!token) return;
    getMyListings(token).then(setListings);
  }, [token]);

  if (!token) {
    return (
      <div className="empty-state">
        <p>Sign in to view your uploaded listings.</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="results-header">
        <h3>Your listings</h3>
        <span>{listings.length} total</span>
      </div>
      <div className="admin-list">
        {listings.length === 0 ? (
          <div className="empty-state">
            <p>No listings yet. Upload one above.</p>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="admin-card">
              <div>
                <strong>{listing.name}</strong>
                <div className="muted">{listing.car?.make} {listing.car?.model} {listing.car?.year}</div>
                <div className="muted">Status: {listing.status}</div>
              </div>
              <div className="part-price">{listing.price}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
