/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/subscriptions/delete-card`, async () => {
  describe('DeleteCard#BEFORE', () => {
    it('should reject invalid cardid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=invalid`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should reject other account\'s card', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const user2 = await TestHelper.createUser()
      await TestHelper.createCustomer(user2)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${user.card.id}`, 'GET')
      req.account = user2.account
      req.session = user2.session
      req.customer = user2.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-cardid')
    })

    it('should reject default payment source', async () => {
      const administrator = await TestHelper.createAdministrator()
      const product = await TestHelper.createProduct(administrator, {published: true})
      await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${user.card.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-card')
    })

    it('should bind card to req', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const card1 = await TestHelper.createCard(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${card1.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.card, null)
      assert.equal(req.data.card.id, card1.id)
    })
  })

  describe('DeleteCard#GET', () => {
    it('should present the form', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user, true)
      const card1 = user.card
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${card1.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('submit-form'))
        assert.notEqual(null, doc.getElementById('submit-button'))
      }
      return req.route.api.get(req, res)
    })

    it('should present the card table', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const card1 = await TestHelper.createCard(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${card1.id}`, 'GET')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const tr = doc.getElementById(card1.id)
        assert.notEqual(null, tr)
      }
      return req.route.api.get(req, res)
    })
  })

  describe('DeleteCard#POST', () => {
    it('should apply after authorization', async () => {
      const user = await TestHelper.createUser()
      await TestHelper.createCustomer(user)
      const card1 = await TestHelper.createCard(user)
      await TestHelper.createCard(user)
      const req = TestHelper.createRequest(`/account/subscriptions/delete-card?cardid=${card1.id}`, 'POST')
      req.account = user.account
      req.session = user.session
      req.customer = user.customer
      req.body = {}
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        req.session = await TestHelper.unlockSession(user)
        const res2 = TestHelper.createResponse()
        res2.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('message-container')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.template)
        }
        return req.route.api.post(req, res2)
      }
      return req.route.api.post(req, res)
    })
  })
})
