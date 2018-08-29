const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (req.customer.id !== req.query.customerid) {
      throw new Error('invalid-customer')
    }
    const result = await dashboard.RedisList.count(`${req.appid}:customer:subscriptions:${req.query.customerid}`)
    return result
  }
}
