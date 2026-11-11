import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { createBookingCalendar } from '../lib/booking-ics.ts'

const source = readFileSync(new URL('../app/api/booking-calendar/route.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
class Response {
  constructor(body, options) { this.body = body; this.headers = options.headers; this.status = 200 }
  static json(body, options) { return { body, status: options.status } }
}
const exports = {}
runInNewContext(compiled, {
  exports,
  require: name => {
    if (name === 'next/server') return { NextResponse: Response }
    if (name === '@/lib/booking-ics') return { createBookingCalendar }
    throw new Error(`Unexpected dependency: ${name}`)
  },
  console: { error() {} },
})

test('calendar route downloads an ICS with the expected content type', () => {
  const searchParams = new URLSearchParams({ date: '2026-11-13', time: '10:30', service: 'Cut', salon: 'Salon', duration: '45' })
  const response = exports.GET({ nextUrl: { searchParams } })
  assert.equal(response.status, 200)
  assert.equal(response.headers['Content-Type'], 'text/calendar; charset=utf-8')
  assert.match(response.headers['Content-Disposition'], /rendez-vous\.ics/)
  assert.match(response.body, /DURATION:PT45M/)
})

test('calendar route rejects invalid details', () => {
  const response = exports.GET({ nextUrl: { searchParams: new URLSearchParams() } })
  assert.equal(response.status, 400)
  assert.equal(response.body.error, 'Invalid calendar details')
})
