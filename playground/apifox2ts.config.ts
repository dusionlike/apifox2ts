import { defineConfig } from 'apifox2ts'

export default defineConfig({
  sourceURL:
    'http://127.0.0.1:4523/export/openapi?projectId=3758637&specialPurpose=openapi-generator',
  ignoreKeys: ['type', 'devId', 'sign'],
})
