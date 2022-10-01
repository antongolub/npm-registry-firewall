export const ACCESS_DENIED =          403
export const NOT_FOUND =              404
export const METHOD_NOT_ALLOWED =     405
export const REQUEST_TIMEOUT =        408
export const INTERNAL_SERVER_ERROR =  500

export const statusMessageMap = {
  [ACCESS_DENIED]: 'Access denied',
  [NOT_FOUND]: 'Not Found',
  [REQUEST_TIMEOUT]: 'Request Timeout',
  [INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [METHOD_NOT_ALLOWED]: 'Method Not Allowed'
}

export const httpError = (code = INTERNAL_SERVER_ERROR, {
  message = statusMessageMap[code] || statusMessageMap[INTERNAL_SERVER_ERROR],
  url = '',
  method = '',
} = {}) => {
  const err = new Error(`HTTP ${code} ${message} ${method} ${url}`)
  err.statusCode = code
  err.statusMessage = message

  return err
}
