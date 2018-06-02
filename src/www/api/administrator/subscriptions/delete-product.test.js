/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/api/administrator/subscriptions/delete-product`, () => {
  describe('DeleteProduct#DELETE', () => {
    it('should reject invalid productid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-product?productid=invalid`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      let errorMessage
      try {
        await req.route.api.delete(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-productid')
    })

    it('should delete product', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/delete-product?productid=${administrator.product.id}`, 'DELETE')
      req.account = administrator.account
      req.session = administrator.session
      req.customer = administrator.customer
      await req.route.api.delete(req)
      await TestHelper.completeAuthorization(req)
      await req.route.api.delete(req)
      // now check the product is deleted
      assert.equal(req.success, true)
    })
  })
})