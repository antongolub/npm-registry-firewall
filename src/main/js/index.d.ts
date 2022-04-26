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
  name?: string | RegExp | Array<string | RegExp>
  org?: string | RegExp | Array<string | RegExp>
  dateRange?: [string, string]
  age?: number | [number] | [number, number]
  version?: string,
  license?: string | RegExp | Array<string | RegExp>
  username?: string | RegExp | Array<string | RegExp>
  filter?: (entry: Record<string, any>) => LetAsync<boolean | undefined | null>
  extend?: string
  plugin?: TPluginConfig
}

type TPluginConfig = string | [string, any] | TPlugin | [TPlugin, any]

type TCacheConfig = {
  ttl: number
  evictionTimeout?: number
}

type TCacheFactory = {
  (opts: TCacheConfig): {
    add(key: string, value: any, ttl?: number): LetAsync<any>
    has(key: string): LetAsync<boolean>
    get(key: string): LetAsync<any>
    del(key: string): LetAsync<void>
  }
}

type TFirewallConfig = {
  registry: string
  entrypoint?: string
  token?: string
  base?: string
  rules?: TRule | TRule[]
  cache?: TCacheConfig
  cacheFactory?: TCacheFactory
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
  boundContext: {
    logger: TLogger
    registry: string
    authorization?: string
    entrypoint: string
    name: string
    org?: string
    version?: string
  }
}

type TPlugin = {
  (context: TValidationContext): LetAsync<TPolicy>
}

export function createApp(config: string | TConfig | TConfig[], opts?: {logger: TLogger}): Promise<TApp>

export function createLogger(
  extra?: Record<string, any>,
  formatter?: (logCtx: {level: string, msgChunks: string[], extra: Record<string, any>}) => void
): string
