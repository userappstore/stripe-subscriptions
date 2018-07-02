const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    const result = await dashboard.RedisList.count(`published:products`)
    return result
  }
}