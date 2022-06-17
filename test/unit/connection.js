const connection = (ret, spy = {}) => new Proxy([], {
    get: () => ({
        findMany: (options) => {
            spy.select = options.select
            spy.orderBy = options.orderBy
            spy.where = options.where
            spy.skip = options.skip

            if (options.take) {
                spy.take = options.take
                ret = ret.slice(0, options.take)
            }

            return ret
        }
    })
})

module.exports = connection