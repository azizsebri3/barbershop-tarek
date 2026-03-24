/**
 * 🧪 Script de test complet pour les fixes de sécurité des réservations
 * Lance: node test-booking-security.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001'
const API_BASE = `${BASE_URL}/api`

const tests = []
let passedTests = 0
let failedTests = 0

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

async function test(name, fn) {
  try {
    console.log(`\n${colors.cyan}▶ ${name}${colors.reset}`)
    await fn()
    console.log(`${colors.green}✅ PASS${colors.reset}`)
    passedTests++
  } catch (error) {
    console.log(`${colors.red}❌ FAIL: ${error.message}${colors.reset}`)
    failedTests++
  }
}

async function expectStatus(response, expectedStatus, testName) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status} - ${await response.text()}`)
  }
  return response
}

async function expectError(response, expectedError) {
  const json = await response.json()
  if (!json.error || !json.error.includes(expectedError)) {
    throw new Error(`Expected error containing "${expectedError}", got: ${JSON.stringify(json)}`)
  }
  return json
}

// ========== TEST DATA ==========

let testBookingId = null
let testClientEmail = 'test-security@example.com'
let testBookingData = {
  name: 'Test Client',
  email: testClientEmail,
  phone: '+33612345678',
  date: '2026-03-25',
  time: '14:00',
  service: 'Coupe Homme',
  message: 'Test booking'
}

let testBooking2Data = {
  name: 'Test Client 2',
  email: 'test-other@example.com',
  phone: '+33987654321',
  date: '2026-03-25',
  time: '15:00',
  service: 'Barbe',
  message: 'Test booking 2'
}

let testBooking2Id = null

// ========== TESTS ==========

async function runTests() {
  console.log(`${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║     🔐 BOOKING SECURITY TESTS - Elite Services Project        ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
`)

  // === SETUP: Créer des bookings de test ===
  console.log(`\n${colors.yellow}📋 SETUP - Creating test bookings...${colors.reset}`)

  await test('Create test booking 1', async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBookingData)
    })
    await expectStatus(response, 200)
    const data = await response.json()
    testBookingId = data.booking.id
    console.log(`  📌 Booking ID: ${testBookingId}`)
  })

  await test('Create test booking 2 (different client)', async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBooking2Data)
    })
    await expectStatus(response, 200)
    const data = await response.json()
    testBooking2Id = data.booking.id
    console.log(`  📌 Booking 2 ID: ${testBooking2Id}`)
  })

  // === FIX #6: DELETE route authentication ===
  console.log(`\n${colors.yellow}🔐 FIX #6 - DELETE route authentication${colors.reset}`)

  await test('DELETE without admin token (should fail 401)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${testBooking2Id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    await expectStatus(response, 401)
    await expectError(response, 'unauthorized')
  })

  // === FIX #7: CANCEL route email verification ===
  console.log(`\n${colors.yellow}🔐 FIX #7 - CANCEL route email verification${colors.reset}`)

  await test('CANCEL without email (should fail 400)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelNote: 'Test' })
    })
    await expectStatus(response, 400)
    await expectError(response, 'Email required')
  })

  await test('CANCEL with wrong email (should fail 403)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        cancelNote: 'Test'
      })
    })
    await expectStatus(response, 403)
    await expectError(response, 'Email does not match')
  })

  await test('CANCEL with correct email (should succeed 200)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testClientEmail,
        cancelNote: 'Client cancelled via test'
      })
    })
    await expectStatus(response, 200)
    const data = await response.json()
    if (!data.success) throw new Error('Success flag not true')
  })

  // === FIX #8+9: RESCHEDULE email verification & 1h validation ===
  console.log(`\n${colors.yellow}🔐 FIX #8+9 - RESCHEDULE email verification & 1h validation${colors.reset}`)

  // Create a fresh booking for reschedule tests
  let reschedulingBookingId = null
  await test('Create booking for reschedule tests', async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Reschedule Test',
        email: 'reschedule@example.com',
        phone: '+33611111111',
        date: '2026-03-26',
        time: '10:00',
        service: 'Coupe Homme',
        message: 'For reschedule test'
      })
    })
    await expectStatus(response, 200)
    const data = await response.json()
    reschedulingBookingId = data.booking.id
    console.log(`  📌 Reschedule test booking ID: ${reschedulingBookingId}`)
  })

  await test('RESCHEDULE without email (should fail 400)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${reschedulingBookingId}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newDate: '2026-03-27',
        newTime: '14:00'
      })
    })
    await expectStatus(response, 400)
    await expectError(response, 'Email required')
  })

  await test('RESCHEDULE with wrong email (should fail 403)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${reschedulingBookingId}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wrong@example.com',
        newDate: '2026-03-27',
        newTime: '14:00'
      })
    })
    await expectStatus(response, 403)
    await expectError(response, 'Email does not match')
  })

  await test('RESCHEDULE to valid slot (should succeed 200)', async () => {
    const response = await fetch(`${API_BASE}/bookings/${reschedulingBookingId}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'reschedule@example.com',
        newDate: '2026-03-27',
        newTime: '14:00'
      })
    })
    await expectStatus(response, 200)
    const data = await response.json()
    if (!data.success) throw new Error('Success flag not true')
  })

  // === FIX #5: 1h validation on admin edits ===
  console.log(`\n${colors.yellow}🔐 FIX #5 - 1h validation on admin PUT edits${colors.reset}`)

  // Create bookings to test 1h rule
  let booking1hTest = null
  let booking1hTest2 = null

  await test('Create first 1h validation test booking (14:00)', async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '1h Test 1',
        email: '1h-test@example.com',
        phone: '+33699999999',
        date: '2026-03-28',
        time: '14:00',
        service: 'Coupe Homme',
        message: '1h validation test'
      })
    })
    await expectStatus(response, 200)
    const data = await response.json()
    booking1hTest = data.booking.id
    console.log(`  📌 1h test booking ID: ${booking1hTest}`)
  })

  await test('Create second 1h validation test booking (15:00 - should fail on POST)', async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '1h Test 2',
        email: '1h-test@example.com',
        phone: '+33699999999',
        date: '2026-03-28',
        time: '15:00',
        service: 'Coupe Homme',
        message: '1h validation test - should fail'
      })
    })
    await expectStatus(response, 409)
    await expectError(response, 'minimum 1 hour')
  })

  // === FINAL REPORT ===
  console.log(`
${colors.blue}
╔════════════════════════════════════════════════════════════════╗
║                      📊 TEST RESULTS                          ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✅ PASSED: ${passedTests}${colors.reset}
${colors.red}❌ FAILED: ${failedTests}${colors.reset}

Total: ${passedTests + failedTests} tests

${failedTests === 0 ? `${colors.green}🎉 ALL TESTS PASSED!${colors.reset}` : `${colors.red}⚠️  SOME TESTS FAILED${colors.reset}`}
`)

  process.exit(failedTests === 0 ? 0 : 1)
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`)
  process.exit(1)
})
