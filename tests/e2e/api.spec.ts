import { test, expect } from '@playwright/test';

const API = 'http://localhost:5001/api';

test.describe('API health checks', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ok');
  });

  test('products list returns data', async ({ request }) => {
    const res = await request.get(`${API}/products`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    // Check product shape
    const p = body.data[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('name');
    expect(p).toHaveProperty('slug');
    expect(p).toHaveProperty('basePrice');
  });

  test('featured products endpoint works', async ({ request }) => {
    const res = await request.get(`${API}/products/featured`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('new arrivals endpoint works', async ({ request }) => {
    const res = await request.get(`${API}/products/new-arrivals`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('product by slug returns detail', async ({ request }) => {
    const listRes = await request.get(`${API}/products/featured`);
    const list = await listRes.json();
    const slug = list.data[0]?.slug;
    expect(slug).toBeTruthy();

    const res = await request.get(`${API}/products/${slug}`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    const p = body.data;
    expect(p.slug).toBe(slug);
    expect(p).toHaveProperty('images');
    expect(p).toHaveProperty('variants');
  });

  test('categories endpoint returns data', async ({ request }) => {
    const res = await request.get(`${API}/categories`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('brands endpoint returns data', async ({ request }) => {
    const res = await request.get(`${API}/brands`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('search endpoint works', async ({ request }) => {
    const res = await request.get(`${API}/products/search?q=racket`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('athletes endpoint works', async ({ request }) => {
    const res = await request.get(`${API}/athletes`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('technologies endpoint works', async ({ request }) => {
    const res = await request.get(`${API}/technologies`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
