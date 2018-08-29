const dashboard = require('@userappstore/dashboard')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    if (req.customer.id !== req.query.customerid) {
      throw new Error('invalid-customer')
    }
    return dashboard.RedisList.count(`${req.appid}:customer:invoices:${req.query.customerid}`, req.stripeKey)
  }
}
