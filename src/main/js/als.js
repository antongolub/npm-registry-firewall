import {AsyncLocalStorage} from 'node:async_hooks'

export const als = new AsyncLocalStorage()
export const getCtx = () => als.getStore() || {}
export const attachCtx = (ctx) => als.enterWith(ctx)
export const mixCtx = (mixin) => Object.assign(getCtx(), mixin)
export const runInCtx = (ctx, cb) => als.run(ctx, cb)
