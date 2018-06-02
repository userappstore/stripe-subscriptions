/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe(`/administrator/subscriptions`, async () => {
  describe('Index#BEFORE', () => {
    it('should bind plans to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.plans, null)
      assert.equal(req.data.plans[0].id, administrator.plan.id)
    })

    it('should bind subscriptions to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, administrator.plan.id)
      const req = TestHelper.createRequest(`/administrator/subscriptions`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.subscriptions, null)
      assert.equal(req.data.subscriptions[0].id, user.subscription.id)
    })

    it('should bind coupons to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const req = TestHelper.createRequest(`/administrator/subscriptions`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.coupons, null)
      assert.equal(req.data.coupons[0].id, administrator.coupon.id)
    })
  })

  describe('Index#GET', () => {
    it('should have row for each plan', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const req = TestHelper.createRequest('/administrator/subscriptions', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const plan1Row = doc.getElementById(plan1.id)
        assert.notEqual(null, plan1Row)
        const plan2Row = doc.getElementById(plan2.id)
        assert.notEqual(null, plan2Row)
      }
      return req.route.api.get(req, res)
    })

    it('should have row for each coupon', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const coupon1 = administrator.coupon
      await TestHelper.createCoupon(administrator, {published: true}, {}, 1000, 0)
      const coupon2 = administrator.coupon
      const req = TestHelper.createRequest('/administrator/subscriptions', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const coupon1Row = doc.getElementById(coupon1.id)
        assert.notEqual(null, coupon1Row)
        const coupon2Row = doc.getElementById(coupon2.id)
        assert.notEqual(null, coupon2Row)
      }
      return req.route.api.get(req, res)
    })

    it('should have row for each subscription', async () => {
      const administrator = await TestHelper.createAdministrator()
      const plan1 = await TestHelper.createPlan(administrator, {published: true}, {}, 1000, 0)
      const plan2 = await TestHelper.createPlan(administrator, {published: true}, {}, 2000, 0)
      const user = await TestHelper.createUser()
      await TestHelper.createSubscription(user, plan1.id)
      const subscription1 = user.subscription
      const user2 = await TestHelper.createUser()
      await TestHelper.createSubscription(user2, plan2.id)
      const subscription2 = user2.subscription
      const req = TestHelper.createRequest('/administrator/subscriptions', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const subscription1Row = doc.getElementById(subscription1.id)
        assert.notEqual(null, subscription1Row)
        const subscription2Row = doc.getElementById(subscription2.id)
        assert.notEqual(null, subscription2Row)
      }
      return req.route.api.get(req, res)
    })
  })
})