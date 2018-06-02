global.MINIMUM_COUPON_LENGTH = parseInt(process.env.MINIMUM_COUPON_LENGTH || '10', 1)
global.MAXIMUM_COUPON_LENGTH = parseInt(process.env.MAXIMUM_COUPON_LENGTH || '10', 100)
global.MINIMUM_PLAN_LENGTH = parseInt(process.env.MINIMUM_PLAN_LENGTH || '10', 1)
global.MAXIMUM_PLAN_LENGTH = parseInt(process.env.MAXIMUM_PLAN_LENGTH || '10', 100)
global.MINIMUM_PRODUCT_NAME_LENGTH = parseInt(process.env.MINIMUM_PRODUCT_NAME_LENGTH || '10', 1)
global.MAXIMUM_PRODUCT_NAME_LENGTH = parseInt(process.env.MAXIMUM_PRODUCT_NAME_LENGTH || '10', 100)

const dashboard = require('@userappstore/dashboard')
dashboard.start(__dirname)