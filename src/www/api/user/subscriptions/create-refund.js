const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

module.exports = {
  lock: true,
  before: async (req) => {
    if (!req.query || !req.query.chargeid) {
      throw new Error('invalid-chargeid')
    }
    let charge
    try {
      charge = await stripe.charges.retrieve(req.query.chargeid, req.stripeKey)
    } catch (error) {
    }
    if (!charge) {
      const exists = await dashboard.RedisList.exists(`charges`, req.query.chargeid)
      if (exists) {
        throw new Error('invalid-account')
      }
      throw new Error('invalid-chargeid')
    }
    if (charge.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    req.charge = charge
  },
  post: async (req) => {
    const refundInfo = {
      charge: req.charge.id,
      amount: req.charge.amount - (req.charge.amount_refunded || 0),
      reason: 'requested_by_customer'
    }
    try {
      const refund = await stripe.refunds.create(refundInfo, req.stripeKey)
      req.success = true
      return refund
    } catch (error) {
      throw new Error('unknown-error')
    }
  }
}
