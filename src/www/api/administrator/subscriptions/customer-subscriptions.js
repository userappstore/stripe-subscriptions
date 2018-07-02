const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.customerid) {
      throw new Error('invalid-customerid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`customer:subscriptions:${req.query.customerid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const subscriptionid of itemids) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionid, req.stripeKey)
      items.push(subscription)
    }
    return items
  }
}