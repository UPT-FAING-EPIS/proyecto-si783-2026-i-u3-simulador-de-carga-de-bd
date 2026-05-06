import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'

// ─── Lee las variables de entorno de Vite ────────────────────────────────────
const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string | undefined,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string | undefined,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL       as string | undefined,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string | undefined,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string | undefined,
}

// Firebase sólo funciona si la databaseURL está presente
export const isConfigured = !!cfg.databaseURL && !!cfg.apiKey

let app: FirebaseApp | null = null
let db:  Database    | null = null

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(cfg as Required<typeof cfg>) : getApps()[0]
  db  = getDatabase(app)
}

export { db }
