/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/account/subscriptions/subscription', () => {
  describe('Subscription#BEFORE', () => {
    it('should reject invalid subscription', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, false)
      const req = TestHelper.createRequest('/account/subscriptions/subscription?subscriptionid=invalid', 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-subscriptionid')
    })

    it('should reject other account\'s subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2, false)
      const req = TestHelper.createRequest(`/account/subscriptions/subscription?subscriptionid=${user.subscription.id}`, 'POST')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should bind subscription to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/subscription?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.subscription, null)
      assert.equal(req.data.subscription.id, user.subscription.id)
    })
  })

  describe('Subscription#GET', () => {
    it('should present the subscription table', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/account/subscriptions/subscription?subscriptionid=${user.subscription.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(user.subscription.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })
})