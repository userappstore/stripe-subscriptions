const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')
const statuses = ['active', 'trialing', 'past_due', 'canceled', 'unpaid']
const intervals = ['day', 'week', 'month', 'year']

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.user.subscriptions.Subscription.get(req)
  if (subscription.status === 'canceled' || subscription.customer !== req.customer.id) {
    throw new Error('invalid-subscription')
  }
  subscription.plan_name = subscription.plan.name
  subscription.currency = subscription.plan.currency.toUpperCase()
  subscription.interval = subscription.plan.interval
  subscription.interval_count = subscription.plan.interval_count
  subscription.created = dashboard.Timestamp.date(subscription.start)
  subscription.createdRelative = dashboard.Format.date(subscription.created)
  subscription.priceFormatted = dashboard.Format.money(subscription.plan.amount || 0, subscription.plan.currency)
  if (subscription.status === 'trial') {
    subscription.trial_end = dashboard.Timestamp.date(subscription.trial_end)
    subscription.trialEndRelative = dashboard.Format.date(subscription.trial_end)
  }
  if (!subscription.plan.amount || subscription.status !== 'active' || subscription.cancel_at_period_end) {
    subscription.nextChargeRelative = '-'
    subscription.nextCharge = '-'
  } else {
    subscription.nextCharge = dashboard.Timestamp.date(subscription.current_period_end)
    subscription.nextChargeRelative = dashboard.Format.date(subscription.nextCharge)
  }
  const invoiceList = await global.api.user.subscriptions.Invoices.get(req)
  const invoices = invoiceList.data
  if (invoices && invoices.length) {
    for (const invoice of invoices) {
      invoice.totalFormatted = dashboard.Format.money(invoice.total || 0, invoice.currency)
      invoice.date = dashboard.Timestamp.date(invoice.date)
      invoice.dateRelative = dashboard.Format.date(invoice.date)
      invoice.period_start = dashboard.Timestamp.date(invoice.lines.data[0].period_start)
      invoice.periodStartRelative = dashboard.Format.date(invoice.lines.data[0].period_start)
      invoice.period_end = dashboard.Timestamp.date(invoice.lines.data[0].period_end)
      invoice.periodEndRelative = dashboard.Format.date(invoice.lines.data[0].period_end)
      invoice.plan_name = invoice.lines.data[0].plan.name
    }
  }
  req.data = {subscription, invoices}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  doc.renderTemplate(req.data.subscription, 'subscription-row-template', 'subscriptions-table')
  const removeElements = []
  for (const status of statuses) {
    if (req.data.subscription.status === status) {
      continue
    }
    removeElements.push(`${status}-subscription-${req.data.subscription.id}`)
  }
  if (req.data.subscription.status === 'active') {
    if (req.data.subscription.cancel_at_period_end) {
      removeElements.push(`active-subscription-${req.data.subscription.id}`, `change-plan-link-${req.data.subscription.id}`, `cancel-subscription-link-${req.data.subscription.id}`)
    } else {
      removeElements.push(`canceling-subscription-${req.data.subscription.id}`)
    }
  }
  for (const interval of intervals) {
    if (interval !== req.data.subscription.plan.interval) {
      removeElements.push(`${interval}-singular-interval-${req.data.subscription.id}`, `${interval}-multiple-${req.data.subscription.id}`)
    }
    if (req.data.subscription.plan.interval_count === 1) {
      removeElements.push(`${interval}-multiple-interval-${req.data.subscription.id}`)
    } else {
      removeElements.push(`${interval}-singular-interval-${req.data.subscription.id}`)
    }
  }
  doc.removeElementsById(removeElements)
  if (req.data.invoices && req.data.invoices.length) {
    doc.renderTable(req.data.invoices, 'invoice-row-template', 'invoices-table')
  } else {
    doc.removeElementById('invoicesContainer')
  }
  return dashboard.Response.end(req, res, doc)
}