type TApp = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

type TServerConfig = {
  host?: string
  port?: string | number
  base?: string
  healthcheck?: string | null
  secure?: {
    key: string,
    cert: string
  }
  requestTimeout?: number
  headersTimeout?: number
  keepAliveTimeout?: number
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
}

type TConfig = {
  server: TServerConfig | TServerConfig[]
  firewall: TFirewallConfig
}

export function createApp(config: string | TConfig | TConfig[]): Promise<TApp>
