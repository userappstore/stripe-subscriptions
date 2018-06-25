const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.payoutid) {
    throw new Error('invalid-payoutid')
  }
  const payout = await global.api.administrator.subscriptions.Payout.get(req)
  req.data = {payout}
}

async function renderPage (req, res, messageTemplate) {
  const doc = dashboard.HTML.parse(req.route.html, req.data.payout, 'payout')
  if (req.data.payout.failure_code) {
    dashboard.HTML.renderTemplate(doc, null, req.data.payout.failure_code, `status-${req.data.payout.id}`)
  }
  return dashboard.Response.end(req, res, doc)
}
