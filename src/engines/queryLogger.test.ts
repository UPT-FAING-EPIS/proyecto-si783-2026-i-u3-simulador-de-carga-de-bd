import { describe, expect, it, vi } from 'vitest'
import { clearQueryLogs, getQueryLogs, logQuery } from './queryLogger'

describe('queryLogger', () => {
  it('registra consultas y devuelve primero la mas reciente', async () => {
    clearQueryLogs()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T12:00:00.000Z'))

    const first = await logQuery({
      query: 'SELECT 1',
      processed: 'SELECT 1',
      durationMs: 3,
      rowCount: 1,
      affectedRows: 0,
      success: true,
      dbName: 'demo',
      setsCount: 1,
    })
    const second = await logQuery({
      query: 'SELECT * FROM no_existe',
      durationMs: 2,
      rowCount: 0,
      affectedRows: 0,
      success: false,
      errorMessage: 'Tabla no existe',
    })

    expect(first.timestamp).toBe('2026-07-04T12:00:00.000Z')
    expect(getQueryLogs().map((entry) => entry.id)).toEqual([second.id, first.id])
    expect(getQueryLogs()[0]).toMatchObject({
      success: false,
      errorMessage: 'Tabla no existe',
    })
  })

  it('limpia la bitacora persistida', async () => {
    clearQueryLogs()

    await logQuery({
      query: 'SELECT 1',
      durationMs: 1,
      rowCount: 1,
      affectedRows: 0,
      success: true,
    })

    clearQueryLogs()
    expect(getQueryLogs()).toEqual([])
  })
})
