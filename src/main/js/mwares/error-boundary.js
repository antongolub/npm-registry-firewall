export const errorBoundary = async (err, req, res, next) => {
  const message = err.message || err.res?.statusMessage || 'Internal server error'
  const code = err.status || err.res?.statusCode || 500

  req.log.error(err)

  res.writeHead(code, {
    'Content-Type': 'text/plain',
    'Connection': 'keep-alive',
    'Content-Length': Buffer.byteLength(message),
  })
    .end(message)
}
