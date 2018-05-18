module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.subscriptionid) {
    throw new Error('invalid-subscriptionid')
  }
  const subscription = await global.api.administrator.subscriptions.Subscription.get(req)
  req.data = {subscription}
}

async function renderPage (req, res) {
  const doc = global.dashboard.HTML.parse(req.route.html)
  doc.renderTemplate(req.data.subscription, 'subscription-row-template', 'subscriptions-table')
  return global.dashboard.Response.end(req, res, doc)
}
