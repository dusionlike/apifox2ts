export type Apifox2tsConfig =
  | Apifox2tsConfigBase
  | (Apifox2tsConfigBase & { name: string })[]

export interface Apifox2tsConfigBase {
  sourceURL: string
  name?: string
  destDir?: string
}

export function defineConfig(config: Apifox2tsConfig) {
  return config
}
