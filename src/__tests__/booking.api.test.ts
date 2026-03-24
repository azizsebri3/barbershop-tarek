/**
 * 🧪 BOOKING API SECURITY TESTS
 * Tests complets pour valider la sécurité des routes de réservation
 * 
 * Exécution: npm run test
 */

const BASE_URL = 'http://localhost:3001'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  statusCode?: number
}

const results: TestResult[] = []

/**
 * Utilitaires de test
 */
async function makeRequest(
  path: string,
  method: string = 'GET',
  body?: any
): Promise<{ status: number; data: any }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json().catch(() => ({}))
    return { status: response.status, data }
  } catch (error) {
    throw error
  }
}

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    console.log(`\n▶ ${name}`)
    await fn()
    console.log(`✅ PASS`)
    results.push({ name, passed: true })
  } catch (error: any) {
    console.log(`❌ FAIL: ${error.message}`)
    results.push({
      name,
      passed: false,
      error: error.message,
      statusCode: error.statusCode
    })
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function assertEquals(actual: any, expected: any, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${expected}, got ${actual})`)
  }
}

/**
 * TESTS
 */
async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     🔐 BOOKING API SECURITY TESTS                             ║
║     Elite Services - Projet Tarek                            ║
╚════════════════════════════════════════════════════════════════╝
`)

  let bookingId: string

  // ========== SETUP: Créer un booking test ==========
  await test('SETUP: Create test booking', async () => {
    const response = await makeRequest('/api/bookings', 'POST', {
      name: 'Test User',
      email: 'test.security@email.com',
      phone: '+33612345678',
      date: '2026-03-29',
      time: '12:00',
      service: 'Coupe Homme',
      message: 'Security test'
    })

    assertEquals(response.status, 201, 'Booking should return 201')
    assert(response.data.booking?.id, 'Response should contain booking.id')
    bookingId = response.data.booking.id
    console.log(`   📌 Booking ID: ${bookingId}`)
  })

  // ========== FIX #6: DELETE Authentication ==========
  console.log(`\n🔐 FIX #6: DELETE Route Authentication`)

  await test('DELETE without admin_token should return 401', async () => {
    const response = await makeRequest(`/api/bookings/${bookingId}`, 'DELETE')
    assertEquals(response.status, 401, 'Should return 401 Unauthorized')
    assert(
      response.data.error?.includes('Unauthorized'),
      'Error should mention unauthorized'
    )
  })

  // ========== FIX #7: CANCEL Email Verification ==========
  console.log(`\n🔐 FIX #7: CANCEL Route Email Verification`)

  await test('CANCEL without email should return 400', async () => {
    const response = await makeRequest(`/api/bookings/${bookingId}/cancel`, 'POST', {
      cancelNote: 'Test without email'
    })
    assertEquals(response.status, 400, 'Should return 400 Bad Request')
    assert(
      response.data.error?.includes('Email'),
      'Error should mention email requirement'
    )
  })

  await test('CANCEL with wrong email should return 403', async () => {
    const response = await makeRequest(`/api/bookings/${bookingId}/cancel`, 'POST', {
      email: 'wrong@email.com',
      cancelNote: 'Test with wrong email'
    })
    assertEquals(response.status, 403, 'Should return 403 Forbidden')
    assert(
      response.data.error?.includes('Email'),
      'Error should mention email mismatch'
    )
  })

  await test('CANCEL with correct email should return 200', async () => {
    const response = await makeRequest(`/api/bookings/${bookingId}/cancel`, 'POST', {
      email: 'test.security@email.com',
      cancelNote: 'Cancelled by security test'
    })
    assertEquals(response.status, 200, 'Should return 200 OK')
    assert(response.data.success === true, 'Should have success flag')
  })

  // ========== FIX #8+9: RESCHEDULE Validation ==========
  console.log(`\n🔐 FIX #8+9: RESCHEDULE Route Validation`)

  let rescheduleBookingId: string

  await test('SETUP: Create booking for reschedule test', async () => {
    const response = await makeRequest('/api/bookings', 'POST', {
      name: 'Reschedule Test',
      email: 'reschedule@email.com',
      phone: '+33698765432',
      date: '2026-03-30',
      time: '14:00',
      service: 'Barbe',
      message: 'For reschedule test'
    })

    assertEquals(response.status, 201, 'Booking should return 201')
    rescheduleBookingId = response.data.booking.id
    console.log(`   📌 Reschedule Booking ID: ${rescheduleBookingId}`)
  })

  await test('RESCHEDULE without email should return 400', async () => {
    const response = await makeRequest(
      `/api/bookings/${rescheduleBookingId}/reschedule`,
      'PUT',
      {
        newDate: '2026-03-31',
        newTime: '15:00'
      }
    )
    assertEquals(response.status, 400, 'Should return 400 Bad Request')
  })

  await test('RESCHEDULE with wrong email should return 403', async () => {
    const response = await makeRequest(
      `/api/bookings/${rescheduleBookingId}/reschedule`,
      'PUT',
      {
        email: 'wrong@email.com',
        newDate: '2026-03-31',
        newTime: '15:00'
      }
    )
    assertEquals(response.status, 403, 'Should return 403 Forbidden')
  })

  await test('RESCHEDULE with correct email should return 200', async () => {
    const response = await makeRequest(
      `/api/bookings/${rescheduleBookingId}/reschedule`,
      'PUT',
      {
        email: 'reschedule@email.com',
        newDate: '2026-03-31',
        newTime: '16:00'
      }
    )
    assertEquals(response.status, 200, 'Should return 200 OK')
  })

  // ========== RESULTS ==========
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📊 TEST RESULTS                            ║
╚════════════════════════════════════════════════════════════════╝`)

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const total = results.length

  console.log(`
✅ PASSED: ${passed}
❌ FAILED: ${failed}
📊 TOTAL:  ${total}

`)

  if (failed > 0) {
    console.log('Failed tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  • ${r.name}`)
        console.log(`    Error: ${r.error}`)
      })
  }

  if (failed === 0) {
    console.log(`🎉 ALL TESTS PASSED - READY FOR PRODUCTION! 🚀`)
  }

  console.log('')
  process.exit(failed === 0 ? 0 : 1)
}

// Run tests
runTests().catch(console.error)
