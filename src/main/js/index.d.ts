type LetAsync<T> = T | Promise<T>

type TApp = {
  start: () => Promise<void>
  stop: () => Promise<void>
}

type TLogger = typeof console

type TLogeLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'

type TAgentConfig = {
  keepAliveMsecs?: number
  keepAlive?: number
  maxSockets?: number
  timeout?: number
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
  name?: string
  limit?: number
}

type TCacheImpl = {
  add(key: string, value: any, ttl?: number): LetAsync<any>
  has(key: string): LetAsync<boolean>
  get(key: string): LetAsync<any>
  del(key: string): LetAsync<void>
}

type TCacheFactory = {
  (opts: TCacheConfig): TCacheImpl
}

type TFirewallConfig = {
  registry: string | string[]
  entrypoint?: string
  token?: string
  base?: string
  rules?: TRule | TRule[]
  cache?: TCacheConfig | TCacheImpl | TCacheFactory
  extend?: string
}

type TConfig = {
  server: TServerConfig | TServerConfig[]
  firewall: TFirewallConfig
  agent?: TAgentConfig
  log?: { level?: TLogeLevel }
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

type TAppOpts = {
  logger?: TLogger
  cache?: TCacheFactory
}

export function createApp(config: string | TConfig | TConfig[], opts?: TAppOpts): Promise<TApp>

type TLoggerOptions = {
  extra?: Record<string, any>,
  formatter?: (logCtx: {level: string, msgChunks: string[], extra: Record<string, any>}) => string
}

export function createLogger(options: TLoggerOptions): TLogger
