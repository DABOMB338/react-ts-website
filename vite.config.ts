import { defineConfig } from 'vite'

// Dynamic import for plugin to avoid esbuild require/Esm issue when bundling.
export default async () => {
  const { default: react } = await import('@vitejs/plugin-react')
  return defineConfig({
    plugins: [react()]
  })
}
