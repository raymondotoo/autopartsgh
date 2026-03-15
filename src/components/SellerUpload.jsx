import { useMemo, useState } from 'react';
import { uploadImages } from '../services/partsService';

const categories = [
  'Brakes',
  'Engine',
  'Electrical',
  'Suspension',
  'Body',
  'Interior',
  'Cooling',
  'Transmission',
  'Lighting'
];

const conditions = ['New', 'Used - Good', 'Used - Fair', 'Refurbished'];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function SellerUpload({ cars, onAddPart, token, apiEnabled }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [message, setMessage] = useState('');

  const modelOptions = useMemo(() => {
    return cars.find(car => car.make === make)?.models.map(m => m.name) || [];
  }, [cars, make]);

  const yearOptions = useMemo(() => {
    return cars.find(car => car.make === make)?.models.find(m => m.name === model)?.years || [];
  }, [cars, make, model]);

  const handleImagesChange = async e => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setImageFiles(files);
    if (files.length === 0) {
      setImages([]);
      return;
    }

    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
      setImages(prev => [...prev, ...dataUrls]);
    } catch {
      setImages([]);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!make || !model || !year || !name || !price || !sellerName || !sellerPhone) {
      setMessage('Please complete the required fields before submitting.');
      return;
    }

    if (apiEnabled && !token) {
      setMessage('Please sign in to submit listings to the marketplace API.');
      return;
    }

    let uploadedImages = images.length ? images : ['/part-placeholder.svg'];
    if (apiEnabled && imageFiles.length) {
      const cloudImages = await uploadImages(imageFiles, token);
      if (!cloudImages) {
        setMessage('Image upload failed. Please try again.');
        return;
      }
      uploadedImages = cloudImages;
    }

    const newPart = {
      id: `user-${Date.now()}`,
      name,
      car: { make, model, year: parseInt(year, 10) },
      price,
      category,
      condition,
      location,
      seller: {
        name: sellerName,
        phone: sellerPhone,
        whatsapp: sellerWhatsapp,
        contact: sellerPhone
      },
      images: uploadedImages,
      description: description || 'Seller did not add extra details.'
    };

    await onAddPart(newPart, token);
    setMessage(apiEnabled ? 'Listing submitted for review.' : 'Listing saved in this browser.');

    setMake('');
    setModel('');
    setYear('');
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setCondition('');
    setLocation('');
    setSellerName('');
    setSellerPhone('');
    setSellerWhatsapp('');
    setImages([]);
    setImageFiles([]);
  };

  return (
    <form className="seller-upload" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="sell-make">Make *</label>
          <select id="sell-make" value={make} onChange={e => setMake(e.target.value)}>
            <option value="">Select make</option>
            {cars.map(car => (
              <option key={car.make} value={car.make}>{car.make}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sell-model">Model *</label>
          <select
            id="sell-model"
            value={model}
            onChange={e => setModel(e.target.value)}
            disabled={!make}
          >
            <option value="">Select model</option>
            {modelOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sell-year">Year *</label>
          <select
            id="sell-year"
            value={year}
            onChange={e => setYear(e.target.value)}
            disabled={!model}
          >
            <option value="">Select year</option>
            {yearOptions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sell-name">Part name *</label>
          <input
            id="sell-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Front brake pads"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-category">Category</label>
          <select id="sell-category" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {categories.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sell-condition">Condition</label>
          <select id="sell-condition" value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="">Select condition</option>
            {conditions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sell-price">Price *</label>
          <input
            id="sell-price"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="120 GHS"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-location">Location</label>
          <input
            id="sell-location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Accra, Kumasi"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-description">Description</label>
          <textarea
            id="sell-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add notes about compatibility, brand, or delivery."
            rows={3}
          />
        </div>
        <div className="field">
          <label htmlFor="sell-seller">Seller name *</label>
          <input
            id="sell-seller"
            value={sellerName}
            onChange={e => setSellerName(e.target.value)}
            placeholder="Kwame Auto"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-phone">Phone *</label>
          <input
            id="sell-phone"
            value={sellerPhone}
            onChange={e => setSellerPhone(e.target.value)}
            placeholder="0244000000"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-whatsapp">WhatsApp</label>
          <input
            id="sell-whatsapp"
            value={sellerWhatsapp}
            onChange={e => setSellerWhatsapp(e.target.value)}
            placeholder="+233244000000"
          />
        </div>
        <div className="field">
          <label htmlFor="sell-images">Photos (up to 3)</label>
          <input
            id="sell-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          {images.length ? (
            <div className="image-previews">
              {images.map((src, index) => (
                <img key={String(index)} src={src} alt="Preview" />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="primary-button" type="submit">Save listing</button>
    </form>
  );
}

export default SellerUpload;
