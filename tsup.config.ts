import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    format: ['cjs', 'esm'],
    target: 'node16.14',
    dts: true,
    platform: 'node',
  },
  {
    entry: ['./src/cli.ts'],
    format: ['cjs'],
    target: 'node16.14',
    dts: false,
    platform: 'node',
    bundle: false,
  },
  {
    entry: ['./src/request.ts'],
    format: ['cjs', 'esm'],
    target: 'es2020',
    dts: true,
    platform: 'neutral',
    outDir: 'dist',
  },
])
