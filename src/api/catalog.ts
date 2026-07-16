const API_URL = import.meta.env.VITE_API_URL || '/api';
export interface CatalogProduct { id: number; name: string; slug: string; description: string; price: string; image_url: string; discount_percent: number; average_rating: string; category_name: string; brand_name: string }
export async function fetchCatalogProducts(filters: Record<string, string> = {}): Promise<{ items: CatalogProduct[]; count: number }> {
  const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, value]) => value))).toString();
  const response = await fetch(`${API_URL}/products/${query ? `?${query}` : ''}`);
  if (!response.ok) throw new Error('Unable to load products.');
  const data = await response.json() as { results: CatalogProduct[]; count: number };
  return { items: data.results, count: data.count };
}
export async function fetchCatalogProduct(id: string): Promise<CatalogProduct> { const response = await fetch(`${API_URL}/products/id/${id}/`); if (!response.ok) throw new Error('Product unavailable.'); return response.json() as Promise<CatalogProduct>; }
export async function fetchHomeCatalog(): Promise<{ featured: CatalogProduct[]; flash_deals: CatalogProduct[]; new_arrivals: CatalogProduct[] }> { const response = await fetch(`${API_URL}/home/`); if (!response.ok) throw new Error('Unable to load home catalog.'); return response.json() as Promise<{ featured: CatalogProduct[]; flash_deals: CatalogProduct[]; new_arrivals: CatalogProduct[] }>; }
export async function fetchCatalogMetadata() {
  const [categories, brands] = await Promise.all([fetch(`${API_URL}/categories/`), fetch(`${API_URL}/brands/`)]);
  return { categories: await categories.json() as { id: number; name: string }[], brands: await brands.json() as { id: number; name: string }[] };
}
export async function submitVendorProduct(access: string, data: Record<string, string | number>) {
  const response = await fetch(`${API_URL}/vendor/products/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify(data) });
  const result = await response.json(); if (!response.ok) throw new Error(result.detail || 'Product submission failed.'); return result;
}
