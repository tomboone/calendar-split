import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'
import { resolve } from 'path'

// Check if local calendar config exists
const localConfigPath = resolve(__dirname, 'src/config/calendars.local.ts')
const hasLocalConfig = existsSync(localConfigPath)

// Load local config if it exists
let localCalendarColumns = 'undefined'
if (hasLocalConfig) {
  // We'll use a dynamic import at build time
  // The actual loading happens via the define replacement
  console.log('Found local calendar config: calendars.local.ts')
}

// https://vite.dev/config/
export default defineConfig(async () => {
  // If local config exists, load it
  if (hasLocalConfig) {
    try {
      const localConfig = await import('./src/config/calendars.local.ts')
      localCalendarColumns = JSON.stringify(localConfig.default.columns)
    } catch (e) {
      console.warn('Failed to load calendars.local.ts:', e)
    }
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      // Inject the local calendar columns at build time
      __LOCAL_CALENDAR_COLUMNS__: localCalendarColumns,
    },
  }
})
