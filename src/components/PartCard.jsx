function formatPhone(value) {
  if (!value) return '';
  return value.replace(/\s+/g, '').replace(/[^+\d]/g, '');
}

function PartCard({ part, onBuy, paymentsEnabled }) {
  const phone = formatPhone(part.seller?.phone || part.seller?.contact || '');
  const whatsapp = formatPhone(part.seller?.whatsapp || part.seller?.contact || '');
  const image = part.images?.[0] || '/part-placeholder.svg';

  return (
    <article className="part-card">
      <div className="part-media">
        <img src={image} alt={part.name} loading="lazy" />
        <span className="part-tag">{part.category || 'Part'}</span>
      </div>
      <div className="part-body">
        <h4>{part.name}</h4>
        <p className="part-desc">{part.description}</p>
        <div className="part-meta">
          <span>{part.condition || 'Condition not set'}</span>
          <span>{part.location || 'Location not set'}</span>
        </div>
        <div className="part-price">{part.price}</div>
        <div className="part-seller">
          <div>
            <strong>{part.seller?.name || 'Seller'}</strong>
            <div className="part-contact">{part.seller?.contact || phone || whatsapp}</div>
          </div>
          <div className="part-actions">
            {phone ? (
              <a className="tiny-button" href={`tel:${phone}`}>Call</a>
            ) : null}
            {whatsapp ? (
              <a
                className="tiny-button"
                href={`https://wa.me/${whatsapp.replace(/^\+/, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
            {paymentsEnabled ? (
              <button className="tiny-button" type="button" onClick={() => onBuy?.(part)}>
                Buy
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default PartCard;
