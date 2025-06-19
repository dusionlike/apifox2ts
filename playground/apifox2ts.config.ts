import { defineConfig } from 'apifox2ts'

export default defineConfig({
  sourceURL:
    'http://127.0.0.1:4523/export/openapi/2?version=3.0',
  ignoreKeys: ['type', 'devId', 'sign'],
})
