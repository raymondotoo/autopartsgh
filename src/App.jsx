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
          <a href="#buyers">Buyers</a>
          <a href="#sellers">Sellers</a>
          {apiEnabled ? <a href="#admin">Admin</a> : null}
          <a href="#about">About</a>
        </nav>
        <a className="primary-button" href="#sellers">List a part</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Built for the Ghana automotive market</p>
            <h1>Match the right part to the right car, every time.</h1>
            <p>
              A single hub for buyers to find compatible parts by make, model, and year —
              and for sellers to showcase inventory with clear photos and contact details.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#buyers">Find parts</a>
              <a className="secondary-button" href="#sellers">Upload inventory</a>
            </div>
            <div className="hero-highlights">
              <div>
                <div className="highlight-title">Simple compatibility</div>
                <div className="highlight-body">Drop-down filters guide buyers to the exact match.</div>
              </div>
              <div>
                <div className="highlight-title">Seller-friendly</div>
                <div className="highlight-body">Quick uploads with images, pricing, and location.</div>
              </div>
              <div>
                <div className="highlight-title">Ready to scale</div>
                <div className="highlight-body">Built to plug into a future API, payments, and logistics.</div>
              </div>
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

        {apiEnabled ? (
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
