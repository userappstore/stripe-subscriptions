const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const exists = await dashboard.RedisList.exists(`cards`, req.query.cardid)
    if (!exists) {
      throw new Error('invalid-cardid')
    }
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    const itemids = await dashboard.RedisList.list(`card:invoices:${req.query.cardid}`, offset)
    if (!itemids || !itemids.length) {
      return null
    }
    const items = []
    for (const invoiceid of itemids) {
      const invoice = await stripe.invoices.retrieve(invoiceid, req.stripeKey)
      items.push(invoice)
    }
    return items
  }
}
