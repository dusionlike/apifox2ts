interface Apifox2tsConfigCommon {
  name?: string
  destDir?: string
  ignoreKeys?: string[]
}

type Apifox2tsConfigWithSourceURL = Apifox2tsConfigCommon & {
  sourceURL: string
  sourcePath?: never
}

type Apifox2tsConfigWithSourcePath = Apifox2tsConfigCommon & {
  sourceURL?: never
  sourcePath: string
}

export type Apifox2tsConfig =
  | Apifox2tsConfigBase
  | (Apifox2tsConfigBase & { name: string })[]

export type Apifox2tsConfigBase =
  | Apifox2tsConfigWithSourceURL
  | Apifox2tsConfigWithSourcePath

export function defineConfig(config: Apifox2tsConfig) {
  return config
}
