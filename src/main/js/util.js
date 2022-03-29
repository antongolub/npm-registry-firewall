export const makeDeferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })

  return {resolve, reject, promise}
}
