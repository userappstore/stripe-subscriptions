/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/subscriptions/card-charges-count', async () => {
  describe('CardChargesCount#GET', () => {
    it('should count all charges on card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, trial_period_days: 0, amount: 10000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForWebhooks(4)
      const req = TestHelper.createRequest(`/api/user/subscriptions/card-charges-count?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const result = await req.route.api.get(req)
      assert.equal(result, 2)
    })
  })
})