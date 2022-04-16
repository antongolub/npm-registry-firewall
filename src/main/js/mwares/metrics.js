import process from 'node:process'

export const metrics = async (req, res) => {
  const formatUptime = (uptime) => {
    const pad = s => (s < 10 ? '0' : '') + s
    const hours = Math.floor(uptime / (60 * 60))
    const minutes = Math.floor(uptime % (60 * 60) / 60)
    const seconds = Math.floor(uptime % 60)

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  }

  res
    .writeHead(200)
    .end(JSON.stringify({
      uptime: formatUptime(process.uptime()),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }))
}
