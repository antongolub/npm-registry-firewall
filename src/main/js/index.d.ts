type TApp = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

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

type TRule = {
  policy: 'allow' | 'deny' | 'warn'
  name?: string | string[]
  org?: string | string[]
  dateRange?: [string, string]
  age?: number | [number] | [number, number]
  version?: string,
  license?: string | string[]
  username?: string | string[],
  filter?: (opts: Record<string, any>) => boolean | undefined | null
  extend?: string
}

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

export function createApp(config: string | TConfig | TConfig[]): Promise<TApp>
