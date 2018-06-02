/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/subscriptions/products', () => {
  describe('Products#GET', () => {
    it('should return product list', async () => {
      const administrator = await TestHelper.createAdministrator()
      await TestHelper.createProduct(administrator, {published: true})
      const product1 = administrator.product
      await TestHelper.createProduct(administrator, {published: true, unpublished: true})
      const product2 = administrator.product
      await TestHelper.createProduct(administrator, {published: true})
      const product3 = administrator.product
      const req = TestHelper.createRequest(`/api/administrator/subscriptions/products`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const products = await req.route.api.get(req)
      assert.equal(true, products.length >= 3)
      assert.equal(products[0].id, product3.id)
      assert.equal(products[1].id, product2.id)
      assert.equal(products[2].id, product1.id)
    })
  })
})