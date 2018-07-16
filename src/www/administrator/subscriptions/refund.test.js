/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/subscriptions/refund', () => {
  describe('Refund#BEFORE', () => {
    it('should reject invalid refundid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest('/administrator/subscriptions/refund?refundid=invalid', 'POST')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-refundid')
    })

    it('should bind refund to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund?refundid=${administrator.refund.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.refund, null)
      assert.equal(req.data.refund.id, administrator.refund.id)
    })
  })

  describe('Refund#GET', () => {
    it('should have row for refund', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, administrator.plan.id)
      await TestHelper.waitForNextItem(`subscription:invoices:${user.subscription.id}`, null)
      const chargeid = await TestHelper.waitForNextItem(`subscription:charges:${user.subscription.id}`, null)
      await TestHelper.createRefund(administrator, chargeid)
      const req = TestHelper.createRequest(`/administrator/subscriptions/refund?refundid=${administrator.refund.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(administrator.refund.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })
})
