import { useMemo, useState } from 'react';
import PartCard from './PartCard';

function BuyerSearch({ cars, parts, onBuy, paymentsEnabled }) {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
    const [selectedPart, setSelectedPart] = useState(null);

  const makeOptions = useMemo(() => cars.map(car => car.make), [cars]);
  const modelOptions = useMemo(() => {
    return cars.find(car => car.make === selectedMake)?.models.map(model => model.name) || [];
  }, [cars, selectedMake]);
  const yearOptions = useMemo(() => {
    return (
      cars
        .find(car => car.make === selectedMake)
        ?.models.find(model => model.name === selectedModel)?.years || []
    );
  }, [cars, selectedMake, selectedModel]);

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesMake = selectedMake ? part.car.make === selectedMake : true;
      const matchesModel = selectedModel ? part.car.model === selectedModel : true;
      const matchesYear = selectedYear ? String(part.car.year) === String(selectedYear) : true;
      const matchesCar = matchesMake && matchesModel && matchesYear;

      const matchesQuery = query
        ? `${part.name} ${part.description}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = category ? part.category === category : true;
      const matchesCondition = condition ? part.condition === condition : true;

      return matchesCar && matchesQuery && matchesCategory && matchesCondition;
    });
  }, [parts, selectedMake, selectedModel, selectedYear, query, category, condition]);

  const categories = useMemo(() => {
    const unique = new Set(parts.map(part => part.category).filter(Boolean));
    return Array.from(unique);
  }, [parts]);

  const conditions = useMemo(() => {
    const unique = new Set(parts.map(part => part.condition).filter(Boolean));
    return Array.from(unique);
  }, [parts]);

  const handleReset = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setQuery('');
    setCategory('');
    setCondition('');
  };

  return (
    <div className="buyer-search">
      <div className="filters">
        <div className="field">
          <label htmlFor="make">Make</label>
          <select id="make" value={selectedMake} onChange={e => setSelectedMake(e.target.value)}>
            <option value="">Select make</option>
            {makeOptions.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            disabled={!selectedMake}
          >
            <option value="">Select model</option>
            {modelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            disabled={!selectedModel}
          >
            <option value="">Select year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="query">Part name or keyword</label>
          <input
            id="query"
            type="text"
            placeholder="Brake pads, alternator, mirror"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select id="condition" value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="">Any condition</option>
            {conditions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <button className="ghost-button" type="button" onClick={handleReset}>
          Clear filters
        </button>
      </div>

      <div className="results">
      <div className="results-header">
        <h3>Matching parts</h3>
        <span>{`${filteredParts.length} found`}</span>
      </div>
      <div className="parts-grid">
          {filteredParts.length === 0 ? (
            <div className="empty-state">
              <p>No parts yet. Try another car or broaden your search.</p>
            </div>
          ) : (
            filteredParts.map(part => (
              <div key={part.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPart(part)}>
                <PartCard part={part} onBuy={onBuy} paymentsEnabled={paymentsEnabled} />
              </div>
            ))
          )}
        </div>
        {selectedPart && (
          <div className="part-images-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSelectedPart(null)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <h3>{selectedPart.name} - Images</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {selectedPart.images && selectedPart.images.length > 0 ? (
                  selectedPart.images.map((img, idx) => (
                    <img key={idx} src={img} alt={selectedPart.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  ))
                ) : (
                  <p>No images available.</p>
                )}
              </div>
              <button className="primary-button" style={{ marginTop: 16 }} onClick={() => setSelectedPart(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerSearch;
