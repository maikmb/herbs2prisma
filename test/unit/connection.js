const { first, take } = require("lodash")

const connection = (ret, spy = {}) => new Proxy([], {
    get: () => ({
        findMany: (options) => {
            spy.select = options.select
            spy.orderBy = options.orderBy
            spy.where = options.where
            spy.skip = options.skip

            if (options.take) {
                spy.take = options.take
                return take(ret, options.take)
            }

            return ret
        },
        update: (options) => {
            spy.where = options.where
            spy.data = options.data
            return ret
        },
        create: (options) => {
            spy.data = options.data
            return ret
        },
        findUnique: (options) => {
            spy.select = options.select
            spy.where = options.where
            spy.orderBy = options.orderBy
            return first(ret)    
        }
    })
})

module.exports = connection