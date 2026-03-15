import { useMemo, useState } from 'react';
import PartCard from './PartCard';

function BuyerSearch({ cars, parts, onBuy, paymentsEnabled }) {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');

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

  const ready = Boolean(selectedMake && selectedModel && selectedYear);

  const filteredParts = useMemo(() => {
    if (!ready) return [];
    return parts.filter(part => {
      const matchesCar =
        part.car.make === selectedMake &&
        part.car.model === selectedModel &&
        String(part.car.year) === String(selectedYear);

      const matchesQuery = query
        ? `${part.name} ${part.description}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = category ? part.category === category : true;
      const matchesCondition = condition ? part.condition === condition : true;

      return matchesCar && matchesQuery && matchesCategory && matchesCondition;
    });
  }, [parts, selectedMake, selectedModel, selectedYear, query, category, condition, ready]);

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
          <span>{ready ? `${filteredParts.length} found` : 'Select car details to start'}</span>
        </div>
        <div className="parts-grid">
          {!ready ? (
            <div className="empty-state">
              <p>Select your car details to see compatible listings.</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="empty-state">
              <p>No parts yet. Try another car or broaden your search.</p>
            </div>
          ) : (
            filteredParts.map(part => (
              <PartCard key={part.id} part={part} onBuy={onBuy} paymentsEnabled={paymentsEnabled} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyerSearch;
