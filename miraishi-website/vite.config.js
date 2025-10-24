import { defineConfig } from 'ite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './'  // ← Tambah ini!
})