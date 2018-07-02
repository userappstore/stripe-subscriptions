const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.productid) {
      throw new Error('invalid-productid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const chargeids = await dashboard.RedisList.list(`product:charges:${req.query.productid}`, offset)
    if (!chargeids || !chargeids.length) {
      return null
    }
    const charges = []
    for (const chargeid of chargeids) {
      const charge = await stripe.charges.retrieve(chargeid, req.stripeKey)
      charges.push(charge)
    }
    return charges
  }
}