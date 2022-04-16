
module.exports = {
  filter({org, name, time, ...restPkgData}) {
    if (name === 'react') {
      return true
    }

    if (org === '@babel') {
      return false
    }

    if (restPkgData.license === 'dbad') {
      return false
    }
  }
}
