
/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/customer-refunds-count', async () => {
  describe('CustomerRefundsCount#GET', () => {
    it('should count all refunds on customer', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 1000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.loadCharge(user, user.subscription.id)
      await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(3)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(5)
      await TestHelper.loadCharge(user, user.subscription.id)
      await TestHelper.createRefund(administrator, user.charge)
      await TestHelper.waitForWebhooks(6)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/customer-refunds-count?customerid=${user.customer.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})