export const firewall = async (req, res, next) => {
  if (!req.packument) {
    return next()
  }

  next()
}
