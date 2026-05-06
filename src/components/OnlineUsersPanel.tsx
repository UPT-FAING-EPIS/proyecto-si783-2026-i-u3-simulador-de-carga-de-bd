import { useState, useEffect } from 'react'
import { X, WifiOff, ExternalLink, Clock } from 'lucide-react'
import { isConfigured } from '../lib/firebase'
import { subscribeToPresence, type OnlineUser } from '../lib/presence'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ENGINE_COLORS: Record<string, string> = {
  mysql:      '#4479a1',
  postgresql: '#336791',
  sqlserver:  '#e74c3c',
  sqlite:     '#0085CA',
  oracle:     '#f80000',
  mongodb:    '#47a248',
  redis:      '#dc382d',
}

function engineLabel(e: string): string {
  const map: Record<string, string> = {
    mysql: 'MySQL', postgresql: 'PostgreSQL', sqlserver: 'SQL Server',
    sqlite: 'SQLite', oracle: 'Oracle', mongodb: 'MongoDB', redis: 'Redis',
  }
  return map[e] ?? e
}

function timeAgo(ts: number | null): string {
  if (!ts) return 'ahora'
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60)  return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  return `${Math.floor(secs / 3600)}h`
}

// ─── Pantalla: Firebase no configurado ───────────────────────────────────────

function NotConfigured({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-600">
        <span className="text-sm font-semibold text-white">Usuarios en línea</span>
        <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-surface-600 transition-all">
          <X size={13} />
        </button>
      </div>

      <div className="p-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-900/20 border border-amber-800/30 flex items-center justify-center">
          <WifiOff size={20} className="text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">Firebase no configurado</p>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Para ver usuarios reales en tiempo real, conecta un proyecto de Firebase
          Realtime Database y agrega las variables de entorno.
        </p>

        <div className="bg-surface-700/60 rounded-xl border border-surface-600 p-3 text-left mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Archivo <span className="font-mono">.env.local</span>
          </p>
          <div className="space-y-0.5 font-mono text-[10px] text-slate-400">
            <div>VITE_FIREBASE_API_KEY=<span className="text-amber-400">tu_api_key</span></div>
            <div>VITE_FIREBASE_DATABASE_URL=<span className="text-amber-400">https://proyecto-rtdb...</span></div>
            <div>VITE_FIREBASE_PROJECT_ID=<span className="text-amber-400">tu_proyecto_id</span></div>
            <div>VITE_FIREBASE_APP_ID=<span className="text-amber-400">1:xxx:web:xxx</span></div>
          </div>
        </div>

        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg text-xs font-semibold
                     bg-orange-500/15 text-orange-400 border border-orange-500/25
                     hover:bg-orange-500/25 transition-all"
        >
          <ExternalLink size={11} />
          Ir a Firebase Console
        </a>
      </div>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
  session?: { username: string; role: string; color: string }
}

export default function OnlineUsersPanel({ onClose, session }: Props) {
  if (!isConfigured) return <NotConfigured onClose={onClose} />

  return <RealPanel onClose={onClose} session={session} />
}

function RealPanel({ onClose, session }: Props) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [peak,  setPeak]  = useState(0)

  useEffect(() => {
    const unsub = subscribeToPresence(list => {
      setUsers(list)
      setPeak(prev => Math.max(prev, list.length))
    })
    return () => { if (typeof unsub === 'function') unsub() }
  }, [])

  const count   = users.length
  const others  = users.filter(u => u.name !== session?.username)
  const meUser  = users.find(u => u.name === session?.username)

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
      style={{ maxHeight: '85vh' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-600 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-sm font-bold text-white">
            {count}
            <span className="text-slate-400 font-normal"> {count === 1 ? 'usuario conectado' : 'usuarios conectados'}</span>
          </span>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-surface-600 transition-all">
          <X size={13} />
        </button>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-surface-600 border-b border-surface-600 shrink-0">
        <div className="px-4 py-2.5">
          <div className="text-[10px] text-slate-500 mb-0.5">Máximo esta sesión</div>
          <div className="text-sm font-bold text-amber-400">{peak}</div>
        </div>
        <div className="px-4 py-2.5">
          <div className="text-[10px] text-slate-500 mb-0.5">Fuente</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Firebase Real-time
          </div>
        </div>
      </div>

      {/* ── Avatar stack ────────────────────────────────────────────────────── */}
      {count > 0 && (
        <div className="px-4 py-3 border-b border-surface-600 shrink-0">
          <div className="flex items-center gap-1 flex-wrap">
            {users.slice(0, 10).map(u => (
              <div key={u.id}
                title={`${u.name} · ${engineLabel(u.engine)}`}
                className="w-7 h-7 rounded-full ring-2 ring-surface-800 flex items-center justify-center text-[11px] font-bold text-white cursor-default select-none"
                style={{ background: u.color }}>
                {u.name[0].toUpperCase()}
              </div>
            ))}
            {count > 10 && (
              <div className="w-7 h-7 rounded-full ring-2 ring-surface-800 bg-surface-600 flex items-center justify-center text-[9px] font-bold text-slate-400">
                +{count - 10}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User list ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center mb-3">
              <WifiOff size={16} className="text-slate-500" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Nadie conectado aún</p>
            <p className="text-xs text-slate-600 mt-1">Sé el primero en entrar al sistema</p>
          </div>
        ) : (
          <div className="p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">
              Conectados ahora
            </p>
            {users.map(u => {
              const isMe = u.name === session?.username
              return (
                <div key={u.id}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors',
                    isMe
                      ? 'bg-blue-900/20 border border-blue-800/30'
                      : 'bg-surface-700/40 hover:bg-surface-700/70',
                  ].join(' ')}>
                  <div className="relative shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: u.color }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-800" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-semibold text-slate-200 truncate">{u.name}</span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-900/40 text-blue-400 border border-blue-800/40 rounded font-bold shrink-0">
                          TÚ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: ENGINE_COLORS[u.engine] ?? '#94a3b8' }}>
                        {engineLabel(u.engine)}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-[10px] text-slate-500">{u.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 shrink-0">
                    <Clock size={9} />
                    <span className="text-[10px]">{timeAgo(u.connectedAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Footer: tu sesión ───────────────────────────────────────────────── */}
      {!meUser && session && (
        <div className="px-4 py-3 border-t border-surface-600 shrink-0 bg-surface-800/80">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: session.color }}>
                {session.username[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-800" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-300 truncate">{session.username}</div>
              <div className="text-[10px] text-slate-500">{session.role} · conectando…</div>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/40 rounded-full font-bold">
              ACTIVO
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
