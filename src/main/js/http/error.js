export const OK =                     200
export const MULTIPLE_CHOICES =       300
export const PERMANENT_REDIRECT =     301
export const FOUND =                  302
export const NOT_MODIFIED =           304
export const TEMPORARY_REDIRECT =     307
export const ACCESS_DENIED =          403
export const NOT_FOUND =              404
export const METHOD_NOT_ALLOWED =     405
export const REQUEST_TIMEOUT =        408
export const INTERNAL_SERVER_ERROR =  500

export const statusMessages = {
  [OK]:                     'OK',
  [MULTIPLE_CHOICES]:       'Multiple Choices',
  [PERMANENT_REDIRECT]:     'Permanent Redirect',
  [FOUND]:                  'Found',
  [TEMPORARY_REDIRECT]:     'Temporary Redirect',
  [NOT_MODIFIED]:           'Not Modified',
  [ACCESS_DENIED]:          'Access denied',
  [NOT_FOUND]:              'Not Found',
  [REQUEST_TIMEOUT]:        'Request Timeout',
  [INTERNAL_SERVER_ERROR]:  'Internal Server Error',
  [METHOD_NOT_ALLOWED]:     'Method Not Allowed'
}

export const httpError = (code = INTERNAL_SERVER_ERROR, {
  message = statusMessages[code] || statusMessages[INTERNAL_SERVER_ERROR],
  url = '',
  method = '',
} = {}) => {
  const err = new Error(`HTTP ${code} ${message} ${method} ${url}`)
  err.statusCode = code
  err.statusMessage = message

  return err
}
