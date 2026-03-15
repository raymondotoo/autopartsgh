import carsData from '../data/cars.json';
import partsSeed from '../data/parts.json';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'agh_listings_v1';
const API_URL = import.meta.env.VITE_API_URL;

function loadSavedParts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserParts(parts) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
}

async function apiFetch(path, options = {}) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (!res.ok) throw new Error('API request failed');
    return res.json();
  } catch {
    return null;
  }
}

async function fetchSupabaseParts() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return null;

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: item.category,
    condition: item.condition,
    price: item.price,
    location: item.location,
    images: item.images || [],
    car: { make: item.car_make, model: item.car_model, year: item.car_year },
    seller: {
      name: item.seller_name,
      phone: item.seller_phone,
      whatsapp: item.seller_whatsapp,
      contact: item.seller_phone
    }
  }));
}

async function insertSupabasePart(newPart) {
  if (!supabase) return null;

  const payload = {
    name: newPart.name,
    description: newPart.description,
    category: newPart.category,
    condition: newPart.condition,
    price: newPart.price,
    location: newPart.location,
    images: newPart.images,
    car_make: newPart.car.make,
    car_model: newPart.car.model,
    car_year: newPart.car.year,
    seller_name: newPart.seller.name,
    seller_phone: newPart.seller.phone,
    seller_whatsapp: newPart.seller.whatsapp
  };

  const { data, error } = await supabase.from('parts').insert(payload).select('*').single();
  if (error) return null;
  return data;
}

export async function getCars() {
  const apiCars = await apiFetch('/api/cars');
  if (apiCars) return apiCars;
  return carsData;
}

export async function getParts() {
  const apiParts = await apiFetch('/api/parts');
  if (apiParts) return apiParts;

  const supaParts = await fetchSupabaseParts();
  if (supaParts) return supaParts;

  const saved = loadSavedParts().map(part => ({ ...part, source: 'user' }));
  const seed = partsSeed.map(part => ({ ...part, source: 'seed' }));
  return [...seed, ...saved];
}

export async function uploadImages(files, token) {
  if (!API_URL || files.length === 0) return null;

  const signing = await apiFetch('/api/uploads/sign', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!signing) return null;

  const uploads = files.map(async file => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signing.apiKey);
    formData.append('timestamp', signing.timestamp);
    formData.append('signature', signing.signature);
    formData.append('folder', signing.folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${signing.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url;
  });

  try {
    return await Promise.all(uploads);
  } catch {
    return null;
  }
}

export async function addPart(newPart, token) {
  const apiPart = await apiFetch('/api/parts', {
    method: 'POST',
    body: JSON.stringify(newPart),
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (apiPart) return apiPart;

  const supaInsert = await insertSupabasePart(newPart);
  if (supaInsert) return supaInsert;

  const saved = loadSavedParts();
  const updated = [{ ...newPart, source: 'user' }, ...saved];
  saveUserParts(updated);
  return updated;
}

export async function getPendingListings(token) {
  const pending = await apiFetch('/api/admin/listings', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return pending || [];
}

export async function approveListing(id, token) {
  const approved = await apiFetch(`/api/admin/listings/${id}/approve`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return approved;
}

export async function rejectListing(id, token) {
  const rejected = await apiFetch(`/api/admin/listings/${id}/reject`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return rejected;
}

export async function getMyListings(token) {
  const listings = await apiFetch('/api/me/listings', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return listings || [];
}
