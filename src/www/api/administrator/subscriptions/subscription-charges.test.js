/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/administrator/subscriptions/subscription-charges', () => {
  describe('SubscriptionCharges#GET', () => {
    it('should limit charges on subscription to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000})
      const plan2 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000})
      const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 3000})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan1.id)
      await TestHelper.waitForWebhooks(2)
      await TestHelper.changeSubscription(user, plan2.id)
      await TestHelper.waitForWebhooks(4)
      const charge2 = await TestHelper.loadCharge(user, user.subscription.id)
      await TestHelper.changeSubscription(user, plan3.id)
      await TestHelper.waitForWebhooks(6)
      const charge3 = await TestHelper.loadCharge(user, user.subscription.id)
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/subscription-charges?subscriptionid=${user.subscription.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const charges = await req.route.api.get(req)
      assert.equal(charges.length, 2)
      assert.equal(charges[0].id, charge3.id)
      assert.equal(charges[1].id, charge2.id)
    })
  })
})
