/* eslint-env mocha */
const assert = require('assert')
const RequireSubscription = require('./require-subscription.js')
const TestHelper = require('../../test-helper.js')

describe('server/require-subscription', async () => {
  describe('RequireSubscription#AFTER', () => {
    it('should allow non-customer', async () => {
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      await RequireSubscription.after(req)
      assert.equal(null, req.redirect)
    })

    it('should allow customer without subscription access to /account/*', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/change-username`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequireSubscription.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should allow administrator without subscription access to /administrator/', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCustomer(administrator)
      await TestHelper.createCard(administrator)
      const req = TestHelper.createRequest(`/administrator/subscriptions/charges`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequireSubscription.after(req, res)
      assert.notEqual(true, req.redirect)
    })

    it('should redirect unsubscribed customer to the plans list', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      let responseEnded = false
      res.end = (str) => {
        responseEnded = true
      }
      await RequireSubscription.after(req, res)
      assert.equal(true, req.redirect)
      assert.equal(true, responseEnded)
    })
    
    it('should allow customer with subscription to pass', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      const plan = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      await TestHelper.createSubscription(user, plan.id)
      await TestHelper.waitForWebhooks(2)
      const req = TestHelper.createRequest(`/home`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = (str) => {}
      await RequireSubscription.after(req, res)
      assert.notEqual(true, req.redirect)
    })
  })
})
