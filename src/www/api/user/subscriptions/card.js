const stripe = require('stripe')()

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.cardid) {
      throw new Error('invalid-cardid')
    }
    let card
    try {
      card = await stripe.customers.retrieveCard(req.customer.id, req.query.cardid, req.stripeKey)
    } catch (error) {
    }
    if (!card) {
      throw new Error('invalid-cardid')
    }
    if (card.customer !== req.customer.id) {
      throw new Error('invalid-account')
    }
    card.date = global.dashboard.Timestamp.date(card.created)
    return card
  }
}
