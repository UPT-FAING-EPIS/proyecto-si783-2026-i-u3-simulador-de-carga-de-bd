import { describe, expect, it, vi } from 'vitest'
import {
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
  saveHistoryEntry,
  type LoadHistoryEntry,
} from './loadHistory'

const baseEntry: Omit<LoadHistoryEntry, 'id' | 'savedAt'> = {
  mode: 'normal',
  engine: 'mysql',
  duration: 60,
  maxUsers: 100,
  rampUp: 10,
  queryTypes: 'SELECT',
  peakTps: 420,
  avgLatency: 35,
  finalLatency: 40,
  totalErrors: 0,
  finalCpu: 55,
}

describe('loadHistory', () => {
  it('devuelve una lista vacia si localStorage no tiene datos validos', () => {
    localStorage.setItem('simdb_load_history', '{mal json')

    expect(loadHistory()).toEqual([])
  })

  it('guarda las entradas nuevas al inicio y permite eliminarlas', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T10:00:00.000Z'))

    const first = saveHistoryEntry({ ...baseEntry, peakTps: 100 })
    const second = saveHistoryEntry({ ...baseEntry, peakTps: 200 })

    expect(loadHistory().map((entry) => entry.peakTps)).toEqual([200, 100])
    expect(first.savedAt).toBe('2026-07-04T10:00:00.000Z')
    expect(second.id).toMatch(/^\d+-[a-z0-9]{6}$/)

    deleteHistoryEntry(second.id)
    expect(loadHistory()).toHaveLength(1)
    expect(loadHistory()[0].id).toBe(first.id)
  })

  it('limita el historial a las 20 ejecuciones mas recientes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T11:00:00.000Z'))

    for (let i = 0; i < 25; i += 1) {
      saveHistoryEntry({ ...baseEntry, peakTps: i })
    }

    const entries = loadHistory()
    expect(entries).toHaveLength(20)
    expect(entries[0].peakTps).toBe(24)
    expect(entries.at(-1)?.peakTps).toBe(5)

    clearHistory()
    expect(loadHistory()).toEqual([])
  })
})
