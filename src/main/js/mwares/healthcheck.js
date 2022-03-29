export const healthcheck = async (req, res) => {
  res
    .writeHead(200)
    .end(JSON.stringify({status: 'OK'}))
}
