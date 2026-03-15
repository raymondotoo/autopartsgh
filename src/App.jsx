import { useEffect, useState } from 'react';
import BuyerSearch from './components/BuyerSearch';
import SellerUpload from './components/SellerUpload';
import SellerAuth from './components/SellerAuth';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import CheckoutPanel from './components/CheckoutPanel';
import { addPart, getCars, getParts } from './services/partsService';
import { getAuth } from './services/authService';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [parts, setParts] = useState([]);
  const [auth, setAuth] = useState(() => getAuth());
  const [selectedPart, setSelectedPart] = useState(null);
  const [activeView, setActiveView] = useState('buyer');
  const isBuyer = activeView === 'buyer';

  const apiEnabled = Boolean(import.meta.env.VITE_API_URL);
  const supabaseEnabled = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    let active = true;
    Promise.all([getCars(), getParts()]).then(([carsData, partsData]) => {
      if (!active) return;
      setCars(carsData);
      setParts(partsData);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleAddPart = async (newPart, token) => {
    await addPart(newPart, token);
    const updated = await getParts();
    setParts(updated);
  };

  const sellerBlurb = apiEnabled
    ? 'Listings go to the marketplace API for review.'
    : supabaseEnabled
      ? 'Listings are saved to the shared prototype database (Supabase).'
      : 'Listings are stored in this browser only. Add Supabase to share across users.';

  const heroHeading = isBuyer
    ? 'Match the right part to the right car, every time.'
    : 'List inventory fast and reach verified buyers.';
  const heroBody = isBuyer
    ? 'Search by make, model, and year to find compatible parts and contact trusted sellers in minutes.'
    : 'Upload photos, set pricing, and publish to a searchable catalog built for Ghana’s auto market.';
  const highlights = isBuyer
    ? [
        { title: 'Precise matching', body: 'Filters narrow results by exact vehicle fit.' },
        { title: 'Trusted sellers', body: 'Listings include phone + WhatsApp contact details.' },
        { title: 'Fast comparison', body: 'See price, condition, and location at a glance.' }
      ]
    : [
        { title: 'Quick listings', body: 'Capture details once and reuse for future uploads.' },
        { title: 'Clear visibility', body: 'Photos and pricing show your stock instantly.' },
        { title: 'Built to grow', body: 'Ready for payments and approvals when you are.' }
      ];

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">AHG</span>
          <div>
            <div className="brand-name">Autoparts Hub Ghana</div>
            <div className="brand-tag">Find parts fast. Sell with confidence.</div>
          </div>
        </div>
        <nav className="site-nav">
          <div className="view-toggle">
            <button
              className={`toggle ${activeView === 'buyer' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('buyer')}
            >
              Buyer
            </button>
            <button
              className={`toggle ${activeView === 'seller' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveView('seller')}
            >
              Seller
            </button>
          </div>
        </nav>
        <button
          className="primary-button"
          type="button"
          onClick={() => setActiveView('seller')}
        >
          List a part
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              {isBuyer ? 'For buyers' : 'For sellers'} · Built for Ghana
            </p>
            <h1>{heroHeading}</h1>
            <p>{heroBody}</p>
            <div className="hero-actions">
              {isBuyer ? (
                <>
                  <a className="primary-button" href="#buyers">Find parts</a>
                  <button className="secondary-button" type="button" onClick={() => setActiveView('seller')}>
                    Upload inventory
                  </button>
                </>
              ) : (
                <>
                  <a className="primary-button" href="#sellers">List a part</a>
                  <button className="secondary-button" type="button" onClick={() => setActiveView('buyer')}>
                    Browse listings
                  </button>
                </>
              )}
            </div>
            <div className="hero-highlights">
              {highlights.map(item => (
                <div key={item.title}>
                  <div className="highlight-title">{item.title}</div>
                  <div className="highlight-body">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-card">
              <h2>Buyer journey</h2>
              <ol>
                <li>Select your car details.</li>
                <li>Compare matching parts.</li>
                <li>Contact the seller instantly.</li>
              </ol>
            </div>
            <div className="panel-card">
              <h2>Seller journey</h2>
              <ol>
                <li>Upload photos + details.</li>
                <li>Get discovered by compatible cars.</li>
                <li>Close sales via phone or WhatsApp.</li>
              </ol>
            </div>
          </div>
        </section>

        {activeView === 'buyer' ? (
        <section id="buyers" className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">For buyers</p>
              <h2>Search parts by car details</h2>
              <p>Pick a make, model, and year to see compatible parts near you.</p>
            </div>
          </div>
          <BuyerSearch
            cars={cars}
            parts={parts}
            onBuy={setSelectedPart}
            paymentsEnabled={apiEnabled}
          />
        </section>
        ) : null}

        {activeView === 'seller' ? (
        <section id="sellers" className="section">
          <div className="section-header">
            <div>
              <p className="eyebrow">For sellers</p>
              <h2>Upload your parts inventory</h2>
              <p>{sellerBlurb}</p>
            </div>
          </div>
          <div className="seller-stack">
            {apiEnabled ? <SellerAuth auth={auth} onAuthChange={setAuth} /> : null}
            <SellerUpload
              cars={cars}
              onAddPart={handleAddPart}
              token={auth?.token}
              apiEnabled={apiEnabled}
            />
            {apiEnabled ? <SellerDashboard token={auth?.token} /> : null}
          </div>
        </section>
        ) : null}

        {apiEnabled && activeView === 'seller' ? (
          <section id="admin" className="section">
            <div className="section-header">
              <div>
                <p className="eyebrow">Admin queue</p>
                <h2>Approve listings</h2>
                <p>Review pending uploads before they go live.</p>
              </div>
            </div>
            <AdminPanel token={auth?.token} />
          </section>
        ) : null}

        <section id="about" className="section alt">
          <div className="section-header">
            <div>
              <p className="eyebrow">Roadmap-ready</p>
              <h2>Platform design that grows with you</h2>
              <p>
                Starting with GitHub Pages gives us speed and visibility. The architecture
                is ready for a full backend, seller accounts, and payments when you are.
              </p>
            </div>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Structured catalog</h3>
              <p>Normalised car make/model/year data keeps listings accurate and searchable.</p>
            </div>
            <div className="feature-card">
              <h3>Listing workflow</h3>
              <p>Clear fields for condition, price, location, and compatibility reduce back-and-forth.</p>
            </div>
            <div className="feature-card">
              <h3>Ghana-first communication</h3>
              <p>Click-to-call and WhatsApp links keep deals fast and trusted.</p>
            </div>
            <div className="feature-card">
              <h3>Future APIs</h3>
              <p>Swap the JSON store for a database and API without rewriting the UI.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>Autoparts Hub Ghana</strong>
          <p>Central marketplace for trusted auto parts in Ghana.</p>
        </div>
        <div className="footer-links">
          <a href="#buyers">Find parts</a>
          <a href="#sellers">List inventory</a>
          {apiEnabled ? <a href="#admin">Admin</a> : null}
          <a href="#about">Architecture</a>
        </div>
      </footer>

      {selectedPart && apiEnabled ? (
        <CheckoutPanel part={selectedPart} onClose={() => setSelectedPart(null)} />
      ) : null}
    </div>
  );
}

export default App;
