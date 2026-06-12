import { useEffect, useState } from 'react'
import {
  Activity, Users, Shield, Circle, Database,
  Zap, LogOut, AlertTriangle, UserCog, ChevronDown,
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from './lib/firebase'
import { subscribeToSimulatorSessions, type SimulatorSession } from './lib/simulatorSession'
import { subscribeToUsers, updateUserRole, isAdminByUid, type ManagedUser } from './lib/adminUsers'
import AdminLogin from './components/AdminLogin'

function isStaticAdmin(email: string): boolean {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined
  if (!raw) return false
  return raw.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase())
}

const ENGINE_LABELS: Record<string, string> = {
  sqlserver: 'SQL Server', mysql: 'MySQL', postgresql: 'PostgreSQL',
  oracle: 'Oracle', sqlite: 'SQLite', mongodb: 'MongoDB', redis: 'Redis',
}

const QT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SELECT: { bg: '#1d3a6b', text: '#93c5fd', border: '#3b82f6' },
  INSERT: { bg: '#14532d', text: '#86efac', border: '#22c55e' },
  UPDATE: { bg: '#713f12', text: '#fde047', border: '#eab308' },
  DELETE: { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
}

function StatusDot({ status }: { status: SimulatorSession['status'] }) {
  if (status === 'running') return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  )
  if (status === 'completed') return <Circle size={10} style={{ color: '#64748b', fill: '#64748b' }} className="shrink-0" />
  return <Circle size={10} style={{ color: '#334155', fill: '#334155' }} className="shrink-0" />
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  cardStyle: React.CSSProperties
  numStyle: React.CSSProperties
}

function StatCard({ icon, label, value, sub, cardStyle, numStyle }: StatCardProps) {
  return (
    <div style={cardStyle} className="rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-5xl font-black tabular-nums leading-none" style={numStyle}>{value}</p>
        {sub && <p className="text-xs mt-1.5 font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function TabMonitoreo() {
  const [sessions, setSessions] = useState<SimulatorSession[]>([])
  const [, setTick] = useState(0)

  useEffect(() => {
    const unsub = subscribeToSimulatorSessions(setSessions)
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function sinceNow(ts: number | null): string {
    if (!ts) return '—'
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    return `${Math.floor(s / 3600)}h`
  }

  const running = sessions.filter(s => s.status === 'running').length
  const avgTps  = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.tps, 0) / sessions.length) : 0
  const engines = new Set(sessions.filter(s => s.status === 'running').map(s => s.engine)).size

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={15} style={{ color: '#a5b4fc' }} />}
          label="Conectados"
          value={sessions.length}
          cardStyle={{ background: 'linear-gradient(135deg, #312e81, #1e1b4b)', border: '1px solid #4338ca' }}
          numStyle={{ color: '#c7d2fe' }}
        />
        <StatCard
          icon={<Activity size={15} style={{ color: '#6ee7b7' }} />}
          label="Simulando"
          value={running}
          sub={`${sessions.filter(s => s.status === 'idle').length} inactivos`}
          cardStyle={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', border: '1px solid #059669' }}
          numStyle={{ color: '#6ee7b7' }}
        />
        <StatCard
          icon={<Zap size={15} style={{ color: '#fcd34d' }} />}
          label="TPS promedio"
          value={avgTps}
          sub="trans / seg"
          cardStyle={{ background: 'linear-gradient(135deg, #78350f, #451a03)', border: '1px solid #d97706' }}
          numStyle={{ color: '#fcd34d' }}
        />
        <StatCard
          icon={<Database size={15} style={{ color: '#7dd3fc' }} />}
          label="Motores activos"
          value={engines}
          cardStyle={{ background: 'linear-gradient(135deg, #0c4a6e, #082f49)', border: '1px solid #0284c7' }}
          numStyle={{ color: '#7dd3fc' }}
        />
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 rounded-2xl"
          style={{ background: '#131929', border: '1px solid #1e2d45' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Activity size={28} style={{ color: '#4f46e5', opacity: 0.5 }} />
          </div>
          <div className="text-center">
            <p className="font-bold text-base" style={{ color: '#e2e8f0' }}>Sin sesiones activas</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Los usuarios aparecerán aquí en tiempo real</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {sessions.map(s => {
              const activeQTs = Object.entries(s.queryTypes).filter(([, v]) => v).map(([k]) => k)
              return (
                <div key={s.id} className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: '#131929', border: '1px solid #1e2d45' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={s.status} />
                      <span className="font-bold" style={{ color: '#f1f5f9' }}>{s.name}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style={{ background: '#1e2d45', border: '1px solid #2d4163', color: '#94a3b8' }}>
                      {ENGINE_LABELS[s.engine] ?? s.engine}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQTs.length === 0
                      ? <span className="text-xs" style={{ color: '#475569' }}>Sin operaciones</span>
                      : activeQTs.map(qt => {
                          const c = QT_COLORS[qt]
                          return c ? (
                            <span key={qt} className="text-[11px] px-2 py-0.5 rounded font-bold"
                              style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{qt}</span>
                          ) : null
                        })
                    }
                  </div>
                  {s.status === 'running' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        ['TPS', s.tps, s.tps > 200 ? '#fcd34d' : '#6ee7b7'],
                        ['CPU', `${s.cpuUsage.toFixed(0)}%`, s.cpuUsage >= 90 ? '#fca5a5' : '#e2e8f0'],
                        ['Usuarios', `${s.currentUsers}/${s.maxUsers}`, '#e2e8f0'],
                      ].map(([l, v, c]) => (
                        <div key={String(l)} className="rounded-xl p-2.5"
                          style={{ background: '#0f1a2e' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>{l}</p>
                          <p className="text-sm font-black mt-0.5" style={{ color: String(c) }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px]" style={{ color: '#334155' }}>Conectado hace {sinceNow(s.connectedAt)}</p>
                </div>
              )
            })}
          </div>

          <div className="hidden sm:block rounded-2xl overflow-hidden"
            style={{ background: '#131929', border: '1px solid #1e2d45' }}>
            <div className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid #1e2d45' }}>
              <Activity size={15} style={{ color: '#6366f1' }} className="shrink-0" />
              <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>Sesiones en tiempo real</span>
              <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' }}>
                {sessions.length} activas
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e2d45', background: '#0f1a2e' }}>
                    {['Estado','Usuario','Motor','Operaciones','Usuarios','TPS','CPU','Latencia','Tiempo'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => {
                    const activeQTs = Object.entries(s.queryTypes).filter(([, v]) => v).map(([k]) => k)
                    return (
                      <tr key={s.id}
                        style={{ borderBottom: i < sessions.length - 1 ? '1px solid #1a2540' : 'none' }}
                        className="transition-colors hover:bg-[#192038]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <StatusDot status={s.status} />
                            <span className="text-xs font-bold" style={{
                              color: s.status === 'running' ? '#6ee7b7' : s.status === 'completed' ? '#64748b' : '#334155'
                            }}>
                              {s.status === 'running' ? 'Corriendo' : s.status === 'completed' ? 'Finalizado' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold" style={{ color: '#f1f5f9' }}>{s.name}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                            style={{ background: '#1e2d45', border: '1px solid #2d4163', color: '#94a3b8' }}>
                            {ENGINE_LABELS[s.engine] ?? s.engine}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {activeQTs.length === 0
                              ? <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                              : activeQTs.map(qt => {
                                  const c = QT_COLORS[qt]
                                  return c ? (
                                    <span key={qt} className="text-[11px] px-2 py-0.5 rounded font-bold"
                                      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{qt}</span>
                                  ) : null
                                })}
                          </div>
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {s.status === 'running'
                            ? <><span className="font-bold" style={{ color: '#f1f5f9' }}>{s.currentUsers}</span><span style={{ color: '#475569', fontSize: 12 }}>/{s.maxUsers}</span></>
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {s.status === 'running'
                            ? <span className="font-black text-base" style={{ color: s.tps > 200 ? '#fcd34d' : '#6ee7b7' }}>{s.tps}</span>
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {s.status === 'running'
                            ? <span className="font-bold" style={{ color: s.cpuUsage >= 90 ? '#fca5a5' : s.cpuUsage >= 70 ? '#fcd34d' : '#e2e8f0' }}>{s.cpuUsage.toFixed(0)}%</span>
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td className="px-5 py-4 tabular-nums">
                          {s.status === 'running'
                            ? <span className="font-bold" style={{ color: s.latency > 200 ? '#fca5a5' : '#e2e8f0' }}>{s.latency.toFixed(0)}ms</span>
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td className="px-5 py-4 text-xs tabular-nums" style={{ color: '#475569' }}>{sinceNow(s.connectedAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function RoleSelector({ uid, currentRole, loading, onChange }: {
  uid: string; currentRole: string; loading: string | null
  onChange: (uid: string, role: 'Usuario' | 'Administrador') => void
}) {
  const isAdmin = currentRole === 'Administrador'
  const busy    = loading === uid

  return (
    <div className="relative">
      <select
        value={currentRole}
        disabled={busy}
        onChange={e => onChange(uid, e.target.value as 'Usuario' | 'Administrador')}
        className="appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none transition-all disabled:opacity-60"
        style={isAdmin
          ? { background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc' }
          : { background: '#1e2d45', border: '1px solid #2d4163', color: '#64748b' }
        }
      >
        <option value="Usuario">Usuario</option>
        <option value="Administrador">Administrador</option>
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: 'rgba(19,25,41,0.8)' }}>
          <div className="w-3.5 h-3.5 rounded-full animate-spin" style={{ border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }} />
        </div>
      )}
    </div>
  )
}

function TabUsuarios() {
  const [users,   setUsers]   = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    const unsub = subscribeToUsers(setUsers)
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  async function handleRoleChange(uid: string, newRole: 'Usuario' | 'Administrador') {
    setLoading(uid)
    try { await updateUserRole(uid, newRole) }
    finally { setLoading(null) }
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const admins  = users.filter(u => u.role === 'Administrador').length
  const regular = users.filter(u => u.role !== 'Administrador').length

  function formatDate(ts: number) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Users size={15} style={{ color: '#a5b4fc' }} />}
          label="Total usuarios"
          value={users.length}
          cardStyle={{ background: 'linear-gradient(135deg, #312e81, #1e1b4b)', border: '1px solid #4338ca' }}
          numStyle={{ color: '#c7d2fe' }}
        />
        <StatCard
          icon={<Shield size={15} style={{ color: '#d8b4fe' }} />}
          label="Administradores"
          value={admins}
          cardStyle={{ background: 'linear-gradient(135deg, #4a1d96, #2e1065)', border: '1px solid #7c3aed' }}
          numStyle={{ color: '#d8b4fe' }}
        />
        <StatCard
          icon={<UserCog size={15} style={{ color: '#7dd3fc' }} />}
          label="Usuarios regulares"
          value={regular}
          cardStyle={{ background: 'linear-gradient(135deg, #0c4a6e, #082f49)', border: '1px solid #0284c7' }}
          numStyle={{ color: '#7dd3fc' }}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#131929', border: '1px solid #1e2d45' }}>
        <div className="px-6 py-4 flex items-center gap-3 flex-wrap" style={{ borderBottom: '1px solid #1e2d45' }}>
          <UserCog size={15} style={{ color: '#6366f1' }} className="shrink-0" />
          <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>Gestión de usuarios</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="ml-auto rounded-xl px-3 py-2 text-xs outline-none transition-all w-full sm:w-64"
            style={{
              background: '#0f1a2e', border: '1px solid #1e2d45',
              color: '#e2e8f0', fontWeight: 500,
            }}
          />
        </div>

        <div className="flex flex-col sm:hidden" style={{ borderColor: '#1a2540' }}>
          {filtered.map(u => (
            <div key={u.uid} className="p-4 flex flex-col gap-3" style={{ borderBottom: '1px solid #1a2540' }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-extrabold text-white"
                    style={{ background: u.color }}>
                    {u.username[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#f1f5f9' }}>{u.username}</p>
                    <p className="text-xs truncate" style={{ color: '#64748b' }}>{u.email}</p>
                  </div>
                </div>
                <RoleSelector uid={u.uid} currentRole={u.role} loading={loading} onChange={handleRoleChange} />
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: '#64748b' }}>
                <span className="px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: '#1e2d45', border: '1px solid #2d4163', color: '#94a3b8' }}>
                  {u.provider === 'google' ? 'Google' : 'Email'}
                </span>
                <span>{formatDate(u.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2d45', background: '#0f1a2e' }}>
                {['Usuario','Correo','Proveedor','Registrado','Rol'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.uid}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1a2540' : 'none' }}
                  className="transition-colors hover:bg-[#192038]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                        style={{ background: u.color }}>
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold" style={{ color: '#f1f5f9' }}>{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style={{ background: '#1e2d45', border: '1px solid #2d4163', color: '#94a3b8' }}>
                      {u.provider === 'google' ? 'Google' : 'Email'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium" style={{ color: '#64748b' }}>{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    <RoleSelector uid={u.uid} currentRole={u.role} loading={loading} onChange={handleRoleChange} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={30} style={{ color: '#1e2d45' }} />
            <p className="text-sm" style={{ color: '#475569' }}>No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [denied,     setDenied]     = useState(false)
  const [checking,   setChecking]   = useState(false)
  const [activeTab,  setActiveTab]  = useState<'monitor' | 'users'>('monitor')

  useEffect(() => { document.documentElement.classList.remove('light') }, [])

  async function handleAuth(email: string, uid: string) {
    if (isStaticAdmin(email)) { setAdminEmail(email); return }
    setChecking(true)
    const ok = await isAdminByUid(uid)
    setChecking(false)
    if (ok) { setAdminEmail(email) } else { setDenied(true) }
  }

  async function handleLogout() {
    if (auth) await signOut(auth).catch(() => {})
    setAdminEmail(null)
    setDenied(false)
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080d18' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '2px solid rgba(99,102,241,0.25)', borderTopColor: '#6366f1' }} />
        <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Verificando permisos...</p>
      </div>
    </div>
  )

  if (denied) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080d18' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-5 text-center"
        style={{ background: '#131929', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={28} style={{ color: '#f87171' }} />
        </div>
        <div>
          <h2 className="font-extrabold text-xl" style={{ color: '#f1f5f9' }}>Acceso denegado</h2>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: '#64748b' }}>
            Tu cuenta no tiene permisos para acceder al panel.
          </p>
        </div>
        <button onClick={handleLogout}
          className="text-sm font-semibold transition-colors"
          style={{ color: '#818cf8' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
          onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}>
          Intentar con otra cuenta
        </button>
      </div>
    </div>
  )

  if (!adminEmail) return <AdminLogin onAuth={handleAuth} />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080d18' }}>

      {/* Header */}
      <header className="px-5 sm:px-8 py-4 flex items-center gap-4 shrink-0"
        style={{ background: '#0d1527', borderBottom: '1px solid #1a2740' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
          <Shield size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-extrabold tracking-tight" style={{ color: '#f8fafc' }}>Centro de Control</h1>
          <p className="text-[11px] truncate font-medium" style={{ color: '#475569' }}>{adminEmail}</p>
        </div>
        <div className="flex items-center gap-2 mr-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold" style={{ color: '#34d399' }}>En vivo</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          style={{ color: '#64748b', border: '1px solid #1a2740', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}>
          <LogOut size={13} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="px-5 sm:px-8 flex" style={{ background: '#0a1020', borderBottom: '1px solid #1a2740' }}>
        {([
          { key: 'monitor', label: 'Monitoreo', icon: <Activity size={13} /> },
          { key: 'users',   label: 'Usuarios',  icon: <Users size={13} /> },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all"
            style={activeTab === tab.key
              ? { borderColor: '#6366f1', color: '#818cf8' }
              : { borderColor: 'transparent', color: '#475569' }
            }>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-auto p-5 sm:p-8 max-w-screen-xl mx-auto w-full">
        {activeTab === 'monitor' ? <TabMonitoreo /> : <TabUsuarios />}
      </main>
    </div>
  )
}
