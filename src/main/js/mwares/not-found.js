import {httpError, NOT_FOUND} from '../http/index.js'

export const notFound = async (req, res, next) => {
  next(httpError(NOT_FOUND))
}
