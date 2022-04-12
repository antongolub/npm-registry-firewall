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
  requestTimeout?: number,
  headersTimeout?: number,
  keepAliveTimeout?: number,
}

type TRule = {
  policy: 'allow' | 'deny',
  name?: string,
  org?: string,
  dateRange?: [string, string],
  version?: string,
  license?: string | string[]
}

type TFirewallConfig = {
  registry: string
  base?: string
  rules?: TRule | TRule[]
}

type TConfig = {
  server: TServerConfig | TServerConfig[]
  firewall: TFirewallConfig
}

export function createApp(config: string | TConfig | TConfig[]): Promise<TApp>
