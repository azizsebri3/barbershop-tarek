import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { parsePriceCents, productText, reconcileBasket, validateProduct } from '../lib/products.ts'

const product = {
  id: '00000000-0000-4000-8000-000000000001',
  name_en: 'Wax', name_fr: 'Cire', name_nl: '',
  description_en: 'For hair', description_fr: '', description_nl: '',
  price_cents: 1250, stock: 3, active: true, show_when_out_of_stock: true, image_path: null,
}

test('requires a valid name, stock, price, image path and flags', () => {
  assert.ok(validateProduct(product))
  for (const invalid of [
    { name_en: '   ' }, { price_cents: -1 }, { price_cents: 12.5 }, { stock: -1 },
    { stock: NaN }, { active: 'true' }, { show_when_out_of_stock: null }, { image_path: '../unsafe' },
  ]) assert.equal(validateProduct({ ...product, ...invalid }), null)
})

test('uses English when a translation is missing', () => {
  assert.equal(productText(product, 'name', 'fr'), 'Cire')
  assert.equal(productText(product, 'name', 'nl'), 'Wax')
  assert.equal(productText(product, 'description', 'fr'), 'For hair')
})

test('parses EUR amounts exactly and rejects invalid amounts', () => {
  for (const [value, expected] of [['1.05', 105], ['0,1', 10], ['100000', 10000000], ['1.234', null], ['-1', null], ['', null], ['100000.01', null]]) {
    assert.equal(parsePriceCents(value), expected)
  }
})

test('requires a new review after price changes, stock reduction or product removal', () => {
  const basket = { [product.id]: 2 }
  assert.equal(reconcileBasket([product], [product], basket).changed, false)
  assert.equal(reconcileBasket([product], [{ ...product, price_cents: 1300 }], basket).changed, true)
  const reduced = reconcileBasket([product], [{ ...product, stock: 1 }], basket)
  assert.equal(reduced.changed, true)
  assert.equal(reduced.basket[product.id], 1)
  assert.deepEqual(reconcileBasket([product], [], basket).basket, {})
})

function routeSetup(authenticated = false, result = { data: product, error: null }) {
  const operations = []
  const query = {
    select() { operations.push('select'); return this },
    order() { return this },
    eq(field, value) { operations.push(['eq', field, value]); return this },
    or(value) { operations.push(['or', value]); return this },
    insert(value) { operations.push(['insert', value]); return this },
    update(value) { operations.push(['update', value]); return this },
    delete() { operations.push('delete'); return this },
    single() { return Promise.resolve({ data: product, error: null }) },
    maybeSingle() { return Promise.resolve(result) },
    then(resolve, reject) { return Promise.resolve({ data: [product], error: null }).then(resolve, reject) },
  }
  const modules = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@supabase/supabase-js': { createClient: () => ({ from: () => query }) },
    '@/lib/admin-session': { verifyAdminToken: async () => authenticated },
    '@/lib/products': { validateProduct },
  }
  const compiled = ts.transpileModule(readFileSync(new URL('../app/api/products/route.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const exports = {}
  runInNewContext(compiled, {
    exports, require: name => modules[name],
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-key' } },
    console: { error() {} },
  })
  const request = (body, admin = false, id) => ({
    cookies: { get: () => ({ value: 'token' }) },
    nextUrl: new URL(`https://example.invalid/api/products${admin ? '?admin=true' : id !== undefined ? `?id=${encodeURIComponent(id)}` : ''}`),
    json: async () => body,
  })
  return { api: exports, request, operations }
}

test('only active and in-stock or explicitly visible products are public', async () => {
  const { api, request, operations } = routeSetup()
  assert.equal((await api.GET(request())).status, 200)
  assert.deepEqual(operations.find(op => Array.isArray(op) && op[0] === 'eq'), ['eq', 'active', true])
  assert.deepEqual(operations.find(op => Array.isArray(op) && op[0] === 'or'), ['or', 'stock.gt.0,show_when_out_of_stock.eq.true'])
  assert.equal((await api.GET(request(null, true))).status, 401)
})

test('product creation and edits require an admin session and valid data', async () => {
  const guest = routeSetup()
  assert.equal((await guest.api.POST(guest.request(product))).status, 401)
  assert.equal((await guest.api.PUT(guest.request(product))).status, 401)
  assert.equal(guest.operations.length, 0)
  const admin = routeSetup(true)
  assert.equal((await admin.api.POST(admin.request({ ...product, stock: -1 }))).status, 400)
  assert.equal((await admin.api.POST(admin.request(product))).status, 201)
  assert.equal((await admin.api.PUT(admin.request(product))).status, 200)
})

test('quick edits require authentication, validate fields and update only submitted values', async () => {
  const guest = routeSetup()
  assert.equal((await guest.api.PATCH(guest.request({ id: product.id, active: false }))).status, 401)
  const admin = routeSetup(true)
  for (const changes of [{ stock: -1 }, { price_cents: 2.5 }, { active: 'false' }, { name_en: 'Unsafe' }, {}]) {
    assert.equal((await admin.api.PATCH(admin.request({ id: product.id, ...changes }))).status, 400)
  }
  assert.equal((await admin.api.PATCH(admin.request({ id: product.id, stock: 4 }))).status, 200)
  const update = admin.operations.find(op => Array.isArray(op) && op[0] === 'update')[1]
  assert.equal(update.stock, 4)
  assert.equal('active' in update, false)
  assert.equal('price_cents' in update, false)
})

test('deleting a product requires authentication and a valid ID', async () => {
  const guest = routeSetup()
  assert.equal((await guest.api.DELETE(guest.request(null, false, product.id))).status, 401)
  assert.equal(guest.operations.length, 0)
  const admin = routeSetup(true)
  for (const id of [undefined, '', 'not-a-uuid', '-'.repeat(36)]) {
    assert.equal((await admin.api.DELETE(admin.request(null, false, id))).status, 400)
  }
  assert.equal(admin.operations.length, 0)
})

test('deletes only the selected product and reports missing records or database errors', async () => {
  const admin = routeSetup(true)
  const response = await admin.api.DELETE(admin.request(null, false, product.id))
  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  assert.equal(admin.operations.filter(op => op === 'delete').length, 1)
  assert.deepEqual(admin.operations.find(op => Array.isArray(op) && op[0] === 'eq'), ['eq', 'id', product.id])
  const missing = routeSetup(true, { data: null, error: null })
  assert.equal((await missing.api.DELETE(missing.request(null, false, product.id))).status, 404)
  const failure = routeSetup(true, { data: null, error: { message: 'database failure' } })
  assert.equal((await failure.api.DELETE(failure.request(null, false, product.id))).status, 500)
})
