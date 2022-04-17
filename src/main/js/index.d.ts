type LetAsync<T> = T | Promise<T>

type TApp = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

type TLogger = typeof console

type TServerConfig = {
  host?: string
  port?: string | number
  base?: string
  healthcheck?: string | null
  metrics?: string | null
  secure?: {
    key: string,
    cert: string
  }
  requestTimeout?: number
  headersTimeout?: number
  keepAliveTimeout?: number
  extend?: string
}

type TPolicy = 'allow' | 'deny' | 'warn'

type TRule = {
  policy?: TPolicy
  name?: string | string[]
  org?: string | string[]
  dateRange?: [string, string]
  age?: number | [number] | [number, number]
  version?: string,
  license?: string | string[]
  username?: string | string[],
  filter?: (entry: Record<string, any>) => LetAsync<boolean | undefined | null>
  extend?: string
  plugin?: TPluginConfig
}

type TPluginConfig = string | [string, any] | TPlugin | [TPlugin, any]

type TCacheConfig = {
  ttl: number
  evictionTimeout?: number
}

type TFirewallConfig = {
  registry: string
  entrypoint?: string
  token?: string
  base?: string
  rules?: TRule | TRule[]
  cache?: TCacheConfig
  extend?: string
}

type TConfig = {
  server: TServerConfig | TServerConfig[]
  firewall: TFirewallConfig
  extend?: string
}

type TValidationContext = {
  options: any,
  rule: TRule,
  entry: Record<string, any>
}

type TPlugin = {
  (context: TValidationContext): LetAsync<TPolicy>
}

export function createApp(config: string | TConfig | TConfig[]): Promise<TApp>
