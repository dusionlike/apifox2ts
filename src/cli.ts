#!/usr/bin/env node
import path from 'node:path'
import { loadConfig } from 'unconfig'
import { apifox2ts } from '.'
import type { Apifox2tsConfig, Apifox2tsConfigBase } from './config'

function getSource(config: Apifox2tsConfigBase) {
  const { sourceURL, sourcePath } = config

  if (!sourceURL || !sourcePath) {
    throw new Error('sourceURL or sourcePath is required in config')
  }

  return sourceURL || sourcePath
}

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
    const { destDir = 'src/api', name } = item
    const destPath = path.join(destDir, name ? `${name}.ts` : 'index.ts')
    await apifox2ts(getSource(item), destPath, item)
  }
}

run()
