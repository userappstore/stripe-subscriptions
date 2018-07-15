const dashboard = require('@userappstore/dashboard')
const stripe = require('stripe')()

// The creation of objects like charges and invoices that happen
// without user actions are indexed as this webhook is notifed.  All
// other types of data are indexed as created by the user.
let lastTestNumber 
module.exports = {
  auth: false,
  post: async (req) => {
    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(req.bodyRaw, req.headers['stripe-signature'], process.env.ENDPOINT_SECRET)
    } catch (error) {
      throw new Error('invalid-stripe-signature')
    }
    if (!stripeEvent) {
      throw new Error('invalid-stripe-event')
    }
    let invoice, charge, customerid, subscriptionid, planid, productid, cardid
    switch (stripeEvent.type) {
      case 'invoice.created':
        invoice = stripeEvent.data.object
        customerid = invoice.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        if (invoice.lines.data[0].plan.metadata.testNumber && invoice.lines.data[0].plan.metadata.testNumber !== lastTestNumber) {
          return
        }
        await dashboard.RedisList.add('invoices', invoice.id)
        await dashboard.RedisList.add(`customer:invoices:${customerid}`, invoice.id)
        await dashboard.RedisList.add(`plan:invoices:${planid}`, invoice.id)
        await dashboard.RedisList.add(`product:invoices:${productid}`, invoice.id)
        return dashboard.RedisList.add(`subscription:invoices:${subscriptionid}`, invoice.id)
      case 'charge.succeeded':
        charge = stripeEvent.data.object
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        if (invoice.lines.data[0].plan.metadata.testNumber && invoice.lines.data[0].plan.metadata.testNumber !== lastTestNumber) {
          return
        }
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('charges', charge.id)
        await dashboard.RedisList.add(`customer:charges:${customerid}`, charge.id)
        await dashboard.RedisList.add(`subscription:charges:${subscriptionid}`, charge.id)
        await dashboard.RedisList.add(`subscription:cards:${subscriptionid}`, cardid)
        await dashboard.RedisList.add(`product:charges:${productid}`, charge.id)
        await dashboard.RedisList.add(`product:cards:${productid}`, cardid)
        await dashboard.RedisList.add(`plan:cards:${planid}`, cardid)
        await dashboard.RedisList.add(`plan:charges:${planid}`, charge.id)
        await dashboard.RedisList.add(`card:charges:${cardid}`, charge.id)
        await dashboard.RedisList.add(`card:invoices:${cardid}`, invoice.id)
        return dashboard.RedisList.add(`card:subscriptions:${cardid}`, subscriptionid)
      case 'charge.refunded':
        charge = stripeEvent.data.object
        const refund = charge.refunds.data[0]
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        if (invoice.lines.data[0].plan.metadata.testNumber && invoice.lines.data[0].plan.metadata.testNumber !== lastTestNumber) {
          return
        }
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('refunds', refund.id)
        await dashboard.RedisList.add(`customer:refunds:${customerid}`, refund.id)
        await dashboard.RedisList.add(`plan:refunds:${planid}`, refund.id)
        await dashboard.RedisList.add(`product:refunds:${productid}`, refund.id)
        await dashboard.RedisList.add(`subscription:refunds:${subscriptionid}`, refund.id)
        return dashboard.RedisList.add(`card:refunds:${cardid}`, refund.id)
      case 'charge.dispute.created':
        const dispute = stripeEvent.data.object
        cardid = charge.source.id
        invoice = await stripe.invoices.retrieve(charge.invoice, req.stripeKey)
        if (invoice.lines.data[0].plan.metadata.testNumber && invoice.lines.data[0].plan.metadata.testNumber !== lastTestNumber) {
          return
        }
        customerid = charge.customer
        subscriptionid = invoice.subscription || invoice.lines.data[0].subscription
        planid = invoice.lines.data[0].plan.id
        productid = invoice.lines.data[0].plan.product
        await dashboard.RedisList.add('disputes', dispute.id)
        await dashboard.RedisList.add(`customer:disputes:${customerid}`, dispute.id)
        await dashboard.RedisList.add(`plan:disputes:${planid}`, dispute.id)
        await dashboard.RedisList.add(`product:disputes:${productid}`, dispute.id)
        await dashboard.RedisList.add(`subscription:disputes:${subscriptionid}`, dispute.id)
        return dashboard.RedisList.add(`card:disputes:${cardid}`, dispute.id)
      case 'payout.created':
        const payout = stripeEvent.data.object
        if (payout.metadata.testNumber && payout.metadata.testNumber !== lastTestNumber) {
          return
        }
        return dashboard.RedisList.add('payouts', payout.id)
      case 'customer.subscription.deleted':
        const subscription = stripeEvent.data.object
        if (subscription.plan.metadata.testNumber && subscription.plan.metadata.testNumber !== lastTestNumber) {
          return
        }
        customerid = subscription.customer
        planid = subscription.plan.id
        productid = subscription.plan.product
        await dashboard.RedisList.remove('subscriptions', subscription.id)
        await dashboard.RedisList.remove(`customer:subscriptions:${req.customer.id}`, subscription.id)
        await dashboard.RedisList.remove(`plan:subscriptions:${planid}`, subscription.id)
        return dashboard.RedisList.remove(`product:subscriptions:${productid}`, subscription.id)
    }
  }
}
