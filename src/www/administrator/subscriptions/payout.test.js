/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/administrator/subscriptions/payout`, () => {
  describe('Payout#BEFORE', () => {
    it('should bind reject invalid payoutid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/administrator/subscriptions/payout?payoutid=invalid`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-payoutid')
    })

    it('should bind payout to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout = await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(1)
      const req = TestHelper.createRequest(`/administrator/subscriptions/payout?payoutid=${payout.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.payout, null)
      assert.equal(req.data.payout.id, payout.id)
    })
  })

  describe('Payout#GET', () => {
    it('should have row for payout', async () => {
      const administrator = await TestHelper.createAdministrator()
      const payout = await TestHelper.createPayout()
      await TestHelper.waitForWebhooks(1)
      const req = TestHelper.createRequest(`/administrator/subscriptions/payout?payoutid=${payout.id}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res2 = TestHelper.createResponse()
      res2.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const payoutRow = doc.getElementById(payout.id)
        assert.notEqual(null, payoutRow)
      }
      return req.route.api.get(req, res2)
    })
  })
})
