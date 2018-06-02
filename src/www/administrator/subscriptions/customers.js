const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const customers = await global.api.administrator.subscriptions.Customers.get(req)
  if (customers && customers.length) {
    for (const customer of customers) {
      customer.created = dashboard.Timestamp.date(customer.created)
      customer.createdRelative = dashboard.Format.date(customer.created)
      customer.account_balance = customer.account_balance || 0
      customer.accountBalanceFormatted = customer.account_balance < 0 ? dashboard.Format.money(-customer.account_balance, customer.currency) : ''
      customer.numSubscriptions = customer.subscriptions.data.length
      customer.email = customer.email || ''
      customer.discount = customer.discount || ''
      customer.delinquentFormatted = customer.delinquent ? 'Yes' : 'No'
    }
  }
  req.data = {customers}
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  if (req.data.customers && req.data.customers.length) {
    doc.renderTable(req.data.customers, 'customer-row-template', 'customers-table')
  } else {
    doc.removeElementById('customers-table')
  }
  return dashboard.Response.end(req, res, doc)
}