#!/usr/bin/env node
import path from 'node:path'
import { loadConfig } from 'unconfig'
import { apifox2ts } from '.'
import type { Apifox2tsConfig } from './config'

async function run() {
  const { config } = await loadConfig<Apifox2tsConfig | undefined>({
    sources: [
      {
        files: 'apifox2ts.config',
      },
    ],
  })
  if (!config) {
    throw new Error('apifox2ts.config.js is not found')
  }

  const configList = Array.isArray(config) ? config : [config]

  for (const item of configList) {
    const { sourceURL, destDir = 'src/api', name } = item
    const destPath = path.join(destDir, name ? `${name}.ts` : 'index.ts')
    await apifox2ts(sourceURL, destPath, item)
  }
}

run()
