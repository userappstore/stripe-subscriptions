const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    const cardExists = await dashboard.RedisList.exists(`cards`, req.query.cardid)
    const ownCardExists = cardExists ? await dashboard.RedisList.exists(`customer:cards:${req.customer.id}`, req.query.cardid) : false
    if (!ownCardExists) {
      if (cardExists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-cardid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
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