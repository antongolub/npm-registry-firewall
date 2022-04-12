import {notFoundErr} from '../http/index.js'

export const notFound = async (req, res, next) => {
  next(notFoundErr)
}
