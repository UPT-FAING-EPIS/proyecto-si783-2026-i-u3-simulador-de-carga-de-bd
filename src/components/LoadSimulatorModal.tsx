import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  X, Play, Square, Zap, AlertTriangle, Activity,
  Users, Clock, TrendingUp, Database,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { ENGINE_CONFIGS } from '../types'
import type { EngineType } from '../types'

// ─── SVG Live Chart ───────────────────────────────────────────────────────────

interface LiveChartProps {
  data: number[]
  color: string
  label: string
  unit: string
  warningLevel?: number
  criticalLevel?: number
  chartId: string
}

function LiveChart({ data, color, label, unit, warningLevel, criticalLevel, chartId }: LiveChartProps) {
  const W = 400
  const H = 72
  const padY = 4
  const inner = H - padY * 2

  const max = Math.max(...data, 1)
  const lastVal = data[data.length - 1] ?? 0
  const isCritical = criticalLevel !== undefined && lastVal >= criticalLevel
  const isWarning = warningLevel !== undefined && lastVal >= warningLevel
  const lineColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : color

  const pts = data.map((v, i) => {
    const x = data.length < 2 ? 0 : (i / (data.length - 1)) * W
    const y = padY + inner - (v / max) * inner
    return [x, y] as [number, number]
  })

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const polygon  = pts.length > 1
    ? `0,${H} ${polyline} ${W},${H}`
    : ''

  const gradId = `g-${chartId}`

  return (
    <div className="bg-surface-800 rounded-xl p-3 border border-surface-600 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${
          isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white'
        }`}>
          {lastVal.toFixed(0)}{unit}
          {isCritical && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 bg-red-900/40 text-red-400 border border-red-800/50 rounded">CRÍTICO</span>}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 60 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f}
            x1={0} x2={W}
            y1={padY + inner * (1 - f)} y2={padY + inner * (1 - f)}
            stroke="#1e293b" strokeWidth={1}
          />
        ))}

        {/* Warning threshold line */}
        {warningLevel !== undefined && max > 0 && (
          <line
            x1={0} x2={W}
            y1={padY + inner - (warningLevel / max) * inner}
            y2={padY + inner - (warningLevel / max) * inner}
            stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="6,4" opacity={0.5}
          />
        )}

        {/* Fill */}
        {polygon && (
          <polygon points={polygon} fill={`url(#${gradId})`} />
        )}

        {/* Line */}
        {pts.length > 1 && (
          <polyline
            points={polyline}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  )
}

// ─── Progress Bar Indicator ───────────────────────────────────────────────────

function MetricBar({
  label, value, max, unit = '', decimals = 0,
  warningAt = 70, criticalAt = 90,
}: {
  label: string; value: number; max: number; unit?: string
  decimals?: number; warningAt?: number; criticalAt?: number
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  const isCritical = pct >= criticalAt
  const isWarning  = pct >= warningAt

  const barColor  = isCritical ? 'bg-red-500'    : isWarning ? 'bg-amber-500'    : 'bg-emerald-500'
  const textColor = isCritical ? 'text-red-400'   : isWarning ? 'text-amber-400'  : 'text-emerald-400'

  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="text-[11px] text-slate-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[11px] font-semibold tabular-nums w-20 text-right shrink-0 ${textColor}`}>
        {value.toFixed(decimals)}{unit} / {max}{unit}
      </span>
      {isCritical && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-900/30 text-red-400 border border-red-800/40 rounded shrink-0">
          SATURADO
        </span>
      )}
    </div>
  )
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────

function StatBadge({ label, value, color = 'text-white' }: {
  label: string; value: string | number; color?: string
}) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoadMetrics {
  currentUsers: number
  tps: number
  peakTps: number
  latency: number
  cpuUsage: number
  connections: number
  errorCount: number
  elapsedSeconds: number
  totalErrors: number
}

type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'

interface LoadScriptLog {
  id: string
  createdAt: number
  timestamp: string
  type: QueryType
  script: string
  status: 'OK' | 'ERROR'
  users: number
  tps: number
  latency: number
  message: string
}

const LOG_LIMIT = 10

type LoadStatus = 'idle' | 'running' | 'completed'

const EMPTY_METRICS: LoadMetrics = {
  currentUsers: 0, tps: 0, peakTps: 0, latency: 0,
  cpuUsage: 0, connections: 0, errorCount: 0,
  elapsedSeconds: 0, totalErrors: 0,
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function LoadSimulatorModal({ onClose }: { onClose: () => void }) {
  const store = useStore()

  // ── Config ──────────────────────────────────────────────────────────────────
  const [engine,     setEngine]     = useState<EngineType>('mysql')
  const [duration,   setDuration]   = useState(300)
  const [maxUsers,   setMaxUsers]   = useState(200)
  const [rampUp,     setRampUp]     = useState(30)
  const [queryTypes, setQueryTypes] = useState({
    SELECT: true, INSERT: true, UPDATE: false, DELETE: false,
  })

  // ── Runtime state ───────────────────────────────────────────────────────────
  const [status,      setStatus]      = useState<LoadStatus>('idle')
  const [metrics,     setMetrics]     = useState<LoadMetrics>(EMPTY_METRICS)
  const [latencyData, setLatencyData] = useState<number[]>([])
  const [tpsData,     setTpsData]     = useState<number[]>([])
  const [cpuData,     setCpuData]     = useState<number[]>([])
  const [connData,    setConnData]    = useState<number[]>([])
  const [scriptLogs,  setScriptLogs]  = useState<LoadScriptLog[]>([])
  const [logFilter,   setLogFilter]   = useState<'ALL' | QueryType>('ALL')
  const [logSearch,   setLogSearch]   = useState('')
  const [logSort,     setLogSort]     = useState<'TIME_DESC' | 'TIME_ASC' | 'SEVERITY'>('TIME_DESC')
  const engineCfg = ENGINE_CONFIGS[engine]

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const peakRef      = useRef(0)
  const totalErrRef  = useRef(0)
  const logViewportRef = useRef<HTMLDivElement | null>(null)

  const activeQueryTypes = (Object.entries(queryTypes) as Array<[QueryType, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type)

  function pickQueryType(seed: number): QueryType {
    const enabled: QueryType[] = activeQueryTypes.length > 0 ? activeQueryTypes : ['SELECT']
    return enabled[seed % enabled.length]
  }

  function buildScript(type: QueryType, tick: number, userCount: number) {
    const rowIdx = (userCount % 500) + 1
    const productId = (tick % 7) + 1
    const engineHint = engineCfg.name

    switch (type) {
      case 'SELECT':
        return `SELECT * FROM orders WHERE user_id = ${rowIdx} ORDER BY created_at DESC LIMIT 25; -- ${engineHint}`
      case 'INSERT':
        return `INSERT INTO audit_log (user_id, action, created_at) VALUES (${rowIdx}, 'login', NOW()); -- ${engineHint}`
      case 'UPDATE':
        return `UPDATE inventory SET stock = stock - 1 WHERE product_id = ${productId}; -- ${engineHint}`
      case 'DELETE':
        return `DELETE FROM sessions WHERE last_seen < NOW() - INTERVAL 30 DAY; -- ${engineHint}`
    }
  }

  function createLogEntry(type: QueryType, tick: number, currentUsers: number, tps: number, latency: number, errored: boolean): LoadScriptLog {
    const createdAt = Date.now()
    return {
      id: `${createdAt}-${tick}-${type}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt,
      timestamp: new Date().toLocaleTimeString(),
      type,
      script: buildScript(type, tick, currentUsers),
      status: errored ? 'ERROR' : 'OK',
      users: currentUsers,
      tps,
      latency,
      message: errored ? 'Timeout simulado por saturación' : 'Ejecución simulada exitosa',
    }
  }

  function downloadFile(fileName: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  function escapeCsv(value: string | number | undefined | null) {
    const text = String(value ?? '')
    return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const filteredLogs = logFilter === 'ALL'
    ? scriptLogs
    : scriptLogs.filter(log => log.type === logFilter)

  const searchedLogs = useMemo(() => {
    const term = logSearch.trim().toLowerCase()
    if (!term) return filteredLogs

    return filteredLogs.filter(log => {
      return [
        log.timestamp,
        log.type,
        log.status,
        log.message,
        log.script,
        `${log.users}`,
        `${log.tps}`,
        `${log.latency}`,
      ].some(field => field.toLowerCase().includes(term))
    })
  }, [filteredLogs, logSearch])

  const sortedLogs = useMemo(() => {
    const severityWeight = (status: LoadScriptLog['status']) => (status === 'ERROR' ? 1 : 0)

    return [...searchedLogs].sort((left, right) => {
      if (logSort === 'SEVERITY') {
        const severityDiff = severityWeight(right.status) - severityWeight(left.status)
        if (severityDiff !== 0) return severityDiff
        return right.createdAt - left.createdAt
      }

      return logSort === 'TIME_ASC'
        ? left.createdAt - right.createdAt
        : right.createdAt - left.createdAt
    })
  }, [searchedLogs, logSort])

  const visibleLogs = sortedLogs.slice(0, LOG_LIMIT)

  useEffect(() => {
    if (logViewportRef.current) {
      logViewportRef.current.scrollTop = 0
    }
  }, [visibleLogs.length, logFilter, logSearch, status])

  function exportLogsAsJson() {
    if (visibleLogs.length === 0) return
    const payload = JSON.stringify(visibleLogs, null, 2)
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadFile(`sim-carga-logs-${stamp}.json`, payload, 'application/json;charset=utf-8')
  }

  function exportLogsAsCsv() {
    if (visibleLogs.length === 0) return
    const rows = [
      ['timestamp', 'type', 'status', 'users', 'tps', 'latency', 'message', 'script'],
      ...visibleLogs.map(log => [
        log.timestamp,
        log.type,
        log.status,
        log.users,
        log.tps,
        `${log.latency.toFixed(0)}ms`,
        log.message,
        log.script,
      ]),
    ]
    const csv = rows
      .map(row => row.map(value => escapeCsv(value)).join(','))
      .join('\n')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadFile(`sim-carga-logs-${stamp}.csv`, csv, 'text/csv;charset=utf-8')
  }

  // ── Stop ────────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus(prev => prev === 'running' ? 'completed' : prev)
  }, [])

  // ── Reset to idle ──────────────────────────────────────────────────────────
  const resetSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = 0
    peakRef.current = 0
    totalErrRef.current = 0
    setStatus('idle')
    setMetrics(EMPTY_METRICS)
    setLatencyData([])
    setTpsData([])
    setCpuData([])
    setConnData([])
    setScriptLogs([])
    setLogFilter('ALL')
    setLogSearch('')
    setLogSort('TIME_DESC')
  }, [])

  // ── Start ───────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    peakRef.current    = 0
    totalErrRef.current = 0

    setStatus('running')
    setMetrics(EMPTY_METRICS)
    setLatencyData([])
    setTpsData([])
    setCpuData([])
    setConnData([])
    setScriptLogs([])

    startTimeRef.current = Date.now()

    const connLimit    = store.simulation.connectionLimit
    const netLatency   = store.simulation.networkLatency
    const errEnabled   = store.simulation.simulateErrors
    const errProb      = store.simulation.errorProbability / 100

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000

      if (elapsed >= duration) { stop(); return }

      // Virtual users ramp-up curve
      const rampPct      = Math.min(elapsed / Math.max(rampUp, 1), 1)
      const currentUsers = Math.min(Math.floor(rampPct * maxUsers), maxUsers)

      // TPS: each user ~1–3 queries/sec with noise
      const baseQPS = currentUsers * (1 + Math.random() * 2)
      const tps     = Math.max(0, Math.round(baseQPS + (Math.random() - 0.45) * 20))
      peakRef.current = Math.max(peakRef.current, tps)

      // CPU: rises with connection saturation and TPS
      const connRatio = Math.min(currentUsers / Math.max(connLimit, 1), 1)
      const cpuBase   = connRatio * 78 + (tps / 600) * 12
      const cpuUsage  = Math.min(100, Math.max(0, cpuBase + (Math.random() - 0.35) * 8))

      // Active connections: bounded by limit
      const connections = Math.min(currentUsers, connLimit)

      // Latency: spikes when CPU > 70%
      const saturation = Math.max(0, (cpuUsage - 60) / 40)
      const latency    = netLatency + 15 + saturation * 420 + Math.random() * 25

      // Errors
      const errFactor   = errEnabled ? errProb : Math.max(0, (cpuUsage - 82) / 18) * 0.15
      const errorCount  = Math.floor(errFactor * currentUsers * Math.random() * 2.5)
      totalErrRef.current += errorCount

      const scriptsPerTick = Math.max(1, Math.min(4, Math.ceil(tps / 250)))
      const tickLogs = Array.from({ length: scriptsPerTick }, (_, index) => {
        const type = pickQueryType(Math.floor(elapsed * 10) + index)
        const forceError = errEnabled
          ? Math.random() < Math.min(0.5, errProb * 2)
          : cpuUsage >= 92 && Math.random() < 0.25
        return createLogEntry(type, Math.floor(elapsed * 2) + index, currentUsers, tps, latency, forceError)
      })

      const snap: LoadMetrics = {
        currentUsers,
        tps,
        peakTps:        peakRef.current,
        latency,
        cpuUsage,
        connections,
        errorCount,
        elapsedSeconds: elapsed,
        totalErrors:    totalErrRef.current,
      }

      setMetrics(snap)
      setLatencyData(prev => [...prev.slice(-59), latency])
      setTpsData(prev     => [...prev.slice(-59), tps])
      setCpuData(prev     => [...prev.slice(-59), cpuUsage])
      setConnData(prev    => [...prev.slice(-59), connections])
      setScriptLogs(prev  => [...prev.slice(-39), ...tickLogs].slice(-40))
    }, 500)
  }, [duration, maxUsers, rampUp, stop, store.simulation, queryTypes, engineCfg])

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  // ── Derived display values ──────────────────────────────────────────────────
  const progressPct = status === 'completed' ? 100
    : status === 'running' ? Math.min(100, (metrics.elapsedSeconds / duration) * 100)
    : 0
  const timeLeft    = Math.max(0, duration - metrics.elapsedSeconds)
  const isSaturated = metrics.cpuUsage >= 90 || metrics.connections >= store.simulation.connectionLimit * 0.95
  const hasErrors   = metrics.errorCount > 0

  // ── Toggle query type ───────────────────────────────────────────────────────
  function toggleQT(qt: keyof typeof queryTypes) {
    const active = Object.values(queryTypes).filter(Boolean)
    if (active.length === 1 && queryTypes[qt]) return // keep at least one
    setQueryTypes(prev => ({ ...prev, [qt]: !prev[qt] }))
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-surface-900 border border-surface-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '92vh' }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-surface-800 border-b border-surface-600 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/40 shrink-0">
            <Activity size={15} className="text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">Simulador de Carga</span>
              {status === 'running' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/20 text-amber-300 border border-amber-800/30 shrink-0">
                  EN EJECUCIÓN
                </span>
              )}
              {status === 'completed' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/40 shrink-0">
                  COMPLETADO
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {status === 'idle'      && 'Configura los parámetros y presiona Iniciar Prueba'}
              {status === 'running'   && `Corriendo: ${metrics.elapsedSeconds.toFixed(0)}s de ${duration}s · Usuarios virtuales: ${metrics.currentUsers}/${maxUsers}`}
              {status === 'completed' && `Prueba completada · ${metrics.totalErrors} errores totales · Pico TPS: ${metrics.peakTps}`}
            </div>
          </div>

          <div className="flex-1" />

          {status === 'running' && (
            <button
              onClick={stop}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-red-400 bg-red-900/20 hover:bg-red-900/30 border border-red-800/40 transition-all shrink-0"
            >
              <Square size={11} className="fill-red-400" />
              Detener
            </button>
          )}
          {status === 'completed' && (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-slate-200 bg-surface-700 border border-surface-600 hover:bg-surface-600 transition-all shrink-0"
            >
              <Play size={11} />
              Nueva prueba
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-surface-600 transition-all ml-1 shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Progress bar ───────────────────────────────────────────────────── */}
        {status !== 'idle' && (
          <div className="h-1 bg-surface-700 shrink-0">
            <div
              className={`h-full transition-all duration-700 ${
                isSaturated ? 'bg-red-500' : status === 'completed' ? 'bg-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── Config panel (idle / completed) ──────────────────────────────── */}
          {status !== 'running' && (
            <div className="w-60 border-r border-surface-600 flex flex-col shrink-0 overflow-y-auto bg-surface-800/40">
              <div className="p-4 flex flex-col gap-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Configuración</p>

                {/* Engine selector */}
                <div>
                  <label className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Database size={10} /> Motor de BD
                  </label>
                  <select
                    value={engine}
                    onChange={e => setEngine(e.target.value as EngineType)}
                    disabled={status !== 'idle'}
                    className={`w-full h-8 px-2.5 text-xs bg-surface-700 border border-surface-600 rounded-lg text-slate-200 focus:outline-none transition-colors ${status !== 'idle' ? 'opacity-60 cursor-not-allowed' : 'focus:border-blue-500'}`}
                  >
                    {Object.values(ENGINE_CONFIGS).map(cfg => (
                      <option key={cfg.type} value={cfg.type}>{cfg.emoji} {cfg.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-[11px] text-slate-500 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5"><Clock size={10} /> Duración</span>
                    <span className="text-white font-semibold">{duration}s</span>
                  </label>
                  <input type="range" min={30} max={600} step={30} value={duration}
                    onChange={e => setDuration(+e.target.value)}
                    disabled={status !== 'idle'}
                    className={`w-full accent-orange-500 ${status !== 'idle' ? 'opacity-60' : ''}`} />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>30s</span><span>600s</span>
                  </div>
                </div>

                {/* Max virtual users */}
                <div>
                  <label className="text-[11px] text-slate-500 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5"><Users size={10} /> Usuarios virtuales</span>
                    <span className="text-white font-semibold">{maxUsers}</span>
                  </label>
                  <input type="range" min={10} max={500} step={10} value={maxUsers}
                    onChange={e => setMaxUsers(+e.target.value)}
                    disabled={status !== 'idle'}
                    className={`w-full accent-orange-500 ${status !== 'idle' ? 'opacity-60' : ''}`} />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>10</span><span>500</span>
                  </div>
                </div>

                {/* Ramp-up */}
                <div>
                  <label className="text-[11px] text-slate-500 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5"><TrendingUp size={10} /> Rampa de usuarios</span>
                    <span className="text-white font-semibold">{rampUp}s</span>
                  </label>
                  <input type="range" min={5} max={120} step={5} value={rampUp}
                    onChange={e => setRampUp(+e.target.value)}
                    disabled={status !== 'idle'}
                    className={`w-full accent-orange-500 ${status !== 'idle' ? 'opacity-60' : ''}`} />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>5s</span><span>120s</span>
                  </div>
                </div>

                {/* Query types */}
                <div>
                  <label className="text-[11px] text-slate-500 block mb-2">Tipos de consulta</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(queryTypes) as Array<keyof typeof queryTypes>).map(qt => (
                      <label key={qt}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-700 border border-surface-600 transition-colors ${status !== 'idle' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-surface-500'}`}>
                        <input type="checkbox" checked={queryTypes[qt]}
                          onChange={() => toggleQT(qt)}
                          disabled={status !== 'idle'}
                          className={`accent-orange-500 w-3 h-3 shrink-0 ${status !== 'idle' ? 'opacity-60 cursor-not-allowed' : ''}`} />
                        <span className="text-[11px] text-slate-400">{qt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation params note */}
              <div className="mx-4 mb-4 p-2.5 bg-surface-700/60 rounded-lg border border-surface-600/60">
                <div className="text-[10px] text-slate-500 space-y-0.5 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Latencia de red</span>
                    <span className="text-slate-300">{store.simulation.networkLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Límite conexiones</span>
                    <span className="text-slate-300">{store.simulation.connectionLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simular errores</span>
                    <span className={store.simulation.simulateErrors ? 'text-amber-400' : 'text-slate-600'}>
                      {store.simulation.simulateErrors ? `Sí (${store.simulation.errorProbability}%)` : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 mt-auto">
                <button
                  onClick={status === 'completed' ? resetSimulation : start}
                  className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white
                             bg-gradient-to-r from-orange-500 to-red-600
                             hover:from-orange-400 hover:to-red-500
                             shadow-lg shadow-orange-900/30 transition-all active:scale-[0.98]"
                >
                  <Play size={13} className="fill-white" />
                  {status === 'completed' ? 'Nueva Prueba' : 'Iniciar Prueba'}
                </button>
              </div>
            </div>
          )}

          {/* ── Main area ─────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 flex flex-col gap-3">

            {/* ── Idle placeholder ─────────────────────────────────────────────── */}
            {status === 'idle' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/20 flex items-center justify-center">
                    <Activity size={28} className="text-orange-400" />
                  </div>
                  <p className="text-slate-300 font-semibold mb-1">Listo para simular carga</p>
                  <p className="text-slate-500 text-sm mb-5">
                    Configura los parámetros a la izquierda y presiona&nbsp;
                    <span className="text-orange-400 font-medium">Iniciar Prueba</span>.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Users size={14} />,   label: 'Usuarios virtuales', val: maxUsers },
                      { icon: <Clock size={14} />,   label: 'Duración',           val: `${duration}s` },
                      { icon: <Database size={14} />,label: 'Motor',              val: engineCfg.name },
                    ].map(({ icon, label, val }) => (
                      <div key={label} className="bg-surface-800 rounded-xl p-3 border border-surface-600">
                        <div className="flex justify-center text-slate-500 mb-1.5">{icon}</div>
                        <div className="text-white font-bold text-sm">{val}</div>
                        <div className="text-slate-600 text-[10px] mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Running / Completed ───────────────────────────────────────────── */}
            {status !== 'idle' && (
              <>
                {/* Alert banners */}
                {isSaturated && status === 'running' && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-red-900/20 border border-red-800/40 rounded-xl shrink-0">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    <span className="text-xs text-red-300">
                      Sistema saturado — latencia elevada y posibles errores de conexión detectados
                    </span>
                  </div>
                )}
                {hasErrors && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-900/20 border border-amber-800/40 rounded-xl shrink-0">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-300">
                      {metrics.errorCount} error{metrics.errorCount !== 1 ? 'es' : ''} en el último segundo → BD lenta
                    </span>
                  </div>
                )}

                {/* Charts grid */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <LiveChart data={latencyData} color="#3b82f6" label="Latencia (ms)"
                    unit="ms" warningLevel={200} criticalLevel={400} chartId="lat" />
                  <LiveChart data={tpsData}     color="#10b981" label="TPS (consultas/seg)"
                    unit="" chartId="tps" />
                  <LiveChart data={cpuData}     color="#f59e0b" label="Uso de CPU BD (%)"
                    unit="%" warningLevel={70} criticalLevel={90} chartId="cpu" />
                  <LiveChart data={connData}    color="#8b5cf6" label="Conexiones activas"
                    unit="" chartId="conn" />
                </div>

                {/* Critical Indicators panel */}
                <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-600 bg-surface-800/80">
                    <Zap size={12} className="text-amber-400" />
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Indicadores Críticos
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <MetricBar
                      label="CPU BD"
                      value={metrics.cpuUsage}
                      max={100}
                      unit="%"
                      decimals={1}
                      warningAt={70}
                      criticalAt={90}
                    />
                    <MetricBar
                      label="Conexiones"
                      value={metrics.connections}
                      max={store.simulation.connectionLimit}
                      warningAt={80}
                      criticalAt={95}
                    />
                    <MetricBar
                      label="Usuarios activos"
                      value={metrics.currentUsers}
                      max={maxUsers}
                      warningAt={85}
                      criticalAt={100}
                    />
                  </div>

                  {/* Stat badges */}
                  <div className="px-4 py-3 border-t border-surface-600 grid grid-cols-5 gap-2 divide-x divide-surface-700">
                    <StatBadge label="TPS actual"    value={metrics.tps}                        color="text-emerald-400" />
                    <StatBadge label="Pico TPS"      value={metrics.peakTps}                    color="text-blue-400" />
                    <StatBadge label="Latencia"      value={`${metrics.latency.toFixed(0)}ms`}  color="text-white" />
                    <StatBadge label="Errores/seg"   value={metrics.errorCount}                 color={metrics.errorCount > 0 ? 'text-red-400' : 'text-slate-600'} />
                    <StatBadge label="Tiempo rest."  value={`${timeLeft.toFixed(0)}s`}          color="text-amber-400" />
                  </div>
                </div>

                <div className="bg-surface-800 rounded-xl border border-surface-600 overflow-hidden shrink-0">
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-surface-600 bg-surface-800/80">
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-orange-400" />
                      <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Logs de scripts ejecutados
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div className="relative">
                        <input
                          value={logSearch}
                          onChange={e => setLogSearch(e.target.value)}
                          placeholder="Buscar..."
                          className="h-7 w-36 px-2.5 pr-7 rounded-lg text-[10px] bg-surface-700 border border-surface-600 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                        />
                        {logSearch && (
                          <button
                            type="button"
                            onClick={() => setLogSearch('')}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-surface-600"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                      <select
                        value={logFilter}
                        onChange={e => setLogFilter(e.target.value as 'ALL' | QueryType)}
                        className="h-7 px-2 rounded-lg text-[10px] font-semibold bg-surface-700 border border-surface-600 text-slate-200 focus:outline-none focus:border-orange-500"
                      >
                        <option value="ALL">Todos</option>
                        <option value="SELECT">SELECT</option>
                        <option value="INSERT">INSERT</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                      <select
                        value={logSort}
                        onChange={e => setLogSort(e.target.value as 'TIME_DESC' | 'TIME_ASC' | 'SEVERITY')}
                        className="h-7 px-2 rounded-lg text-[10px] font-semibold bg-surface-700 border border-surface-600 text-slate-200 focus:outline-none focus:border-orange-500"
                      >
                        <option value="TIME_DESC">Tiempo ↓</option>
                        <option value="TIME_ASC">Tiempo ↑</option>
                        <option value="SEVERITY">Severidad</option>
                      </select>
                      <span className="text-[10px] text-slate-500 tabular-nums">
                        {visibleLogs.length}/{searchedLogs.length} visibles
                      </span>
                      <span className={`inline-flex items-center gap-1 h-7 px-2 rounded-full text-[10px] font-semibold border ${logSort === 'SEVERITY' ? 'bg-red-900/25 text-red-300 border-red-800/40' : logSort === 'TIME_ASC' ? 'bg-blue-900/25 text-blue-300 border-blue-800/40' : 'bg-orange-900/25 text-orange-300 border-orange-800/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${logSort === 'SEVERITY' ? 'bg-red-400' : logSort === 'TIME_ASC' ? 'bg-blue-400' : 'bg-orange-400'}`} />
                        Orden: {logSort === 'SEVERITY' ? 'Severidad' : logSort === 'TIME_ASC' ? 'Tiempo asc.' : 'Tiempo desc.'}
                      </span>
                      <button
                        type="button"
                        onClick={exportLogsAsJson}
                        disabled={visibleLogs.length === 0}
                        className="h-7 px-2.5 rounded-lg text-[10px] font-semibold text-slate-200 bg-surface-700 border border-surface-600 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        onClick={exportLogsAsCsv}
                        disabled={visibleLogs.length === 0}
                        className="h-7 px-2.5 rounded-lg text-[10px] font-semibold text-slate-200 bg-surface-700 border border-surface-600 hover:bg-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        CSV
                      </button>
                    </div>
                  </div>

                  <div ref={logViewportRef} className="max-h-60 overflow-y-auto p-3">
                    {visibleLogs.length === 0 ? (
                      <div className="text-xs text-slate-500 px-1 py-3">
                        {scriptLogs.length === 0
                          ? 'Los scripts simulados aparecerán aquí cuando empiece la prueba.'
                          : 'No hay registros para el filtro o búsqueda seleccionados.'}
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-surface-600 bg-surface-700/60">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-surface-800/95 backdrop-blur border-b border-surface-600">
                            <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                              <th className="px-3 py-2 font-semibold w-20">Estado</th>
                              <th className="px-3 py-2 font-semibold w-20">Tipo</th>
                              <th className="px-3 py-2 font-semibold w-24">Hora</th>
                              <th className="px-3 py-2 font-semibold w-20">Users</th>
                              <th className="px-3 py-2 font-semibold w-20">TPS</th>
                              <th className="px-3 py-2 font-semibold w-20">Lat</th>
                              <th className="px-3 py-2 font-semibold">Consulta</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleLogs.map(log => (
                              <tr key={log.id} className="border-t border-surface-600/70 align-top hover:bg-surface-700/80 transition-colors">
                                <td className="px-3 py-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${log.status === 'ERROR' ? 'bg-red-900/30 text-red-400 border-red-800/40' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40'}`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-[10px] text-slate-300 font-semibold">{log.type}</td>
                                <td className="px-3 py-2 text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                                <td className="px-3 py-2 text-[10px] text-slate-300 tabular-nums">{log.users}</td>
                                <td className="px-3 py-2 text-[10px] text-slate-300 tabular-nums">{log.tps}</td>
                                <td className="px-3 py-2 text-[10px] text-slate-300 tabular-nums">{log.latency.toFixed(0)}ms</td>
                                <td className="px-3 py-2">
                                  <div className="space-y-1">
                                    <div className="text-[11px] text-slate-100 font-mono break-all leading-relaxed">
                                      {log.script}
                                    </div>
                                    <div className="text-[10px] text-slate-500">{log.message}</div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Mini config sidebar (while running) ───────────────────────────── */}
          {status === 'running' && (
            <div className="w-44 border-l border-surface-600 flex flex-col shrink-0 bg-surface-800/30">
              <div className="p-3 flex flex-col gap-3 flex-1">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Config activa</p>
                <div className="space-y-2 text-[11px]">
                  {[
                    ['Motor',    `${engineCfg.emoji} ${engineCfg.name}`],
                    ['Usuarios', maxUsers],
                    ['Duración', `${duration}s`],
                    ['Rampa',    `${rampUp}s`],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between gap-1">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress mini */}
              <div className="p-3 border-t border-surface-600">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                  <span>Progreso</span>
                  <span className="text-amber-400 font-medium">{progressPct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-slate-600 mt-1">
                  {metrics.elapsedSeconds.toFixed(0)}s / {duration}s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
