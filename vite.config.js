import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'your-username' and 'your-repo-name' with your actual GitHub username and repository name
export default defineConfig({
  plugins: [react()],
  base: '/recurring-scheduler/',
})
