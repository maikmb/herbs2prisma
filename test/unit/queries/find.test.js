const { entity, field, id } = require('@herbsjs/herbs')
const Repository = require('../../../src/repository')
const assert = require('assert')
const prisma = require('../connection')

describe.only('Query Find', () => {

    context('Find all data', () => {

        const givenAnEntity = () => {
            const ParentEntity = entity('A Parent Entity', {})

            return entity('A entity', {
                id: id(Number),
                stringTest: field(String),
                booleanTest: field(Boolean),
                entityTest: field(ParentEntity),
                entitiesTest: field([ParentEntity]),
            })
        }

        const givenAnRepositoryClass = (options) => {
            return class ItemRepositoryBase extends Repository {
                constructor(options) {
                    super(options)
                }
            }
        }

        it('should return entities using table field', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find()

            //then
            assert.strictEqual(ret.length, 2)
        })

        it('should return entities with collumn order by', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ orderBy: 'stringTest' })

            //then
            assert.strictEqual(ret.length, 2)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.orderBy, 'stringTest')
        })

        it('should return entities with limit', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ limit: 1 })

            //then
            assert.strictEqual(ret.length, 1)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.take, 1)
        })

        it('should return all entities when limit is 0', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ limit: 0 })

            //then
            assert.strictEqual(ret.length, 2)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
        })

        it('should return data with offset', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ offset: 10 })

            //then
            assert.strictEqual(ret.length, 2)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.skip, 10)
        })

        it('should return entities with complex order by', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ orderBy: [{ column: 'nome', order: 'desc' }, 'email'] })

            //then
            assert.strictEqual(ret.length, 2)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.orderBy, [{ column: 'nome', order: 'desc' }, 'email'])
        })

        it('should return error when order by is a empty object', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            try {
                //when
                const ret = await itemRepo.find({ orderBy: {} })
            } catch (error) {
                //then
                assert.deepStrictEqual(error, 'order by is invalid')
            }
        })
    })

    context('Find with conditions', () => {
        const givenAnEntity = () => {
            const ParentEntity = entity('A Parent Entity', {})

            return entity('A entity', {
                id: id(Number),
                stringTest: field(String),
                booleanTest: field(Boolean),
                entityTest: field(ParentEntity),
                entitiesTest: field([ParentEntity]),
            })
        }

        const givenAnRepositoryClass = (options) => {
            return class ItemRepositoryBase extends Repository {
                constructor(options) {
                    super(options)
                }
            }
        }

        it('should return entities using table field', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true },
                { id: 2, string_test: "clare", boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ where: { stringTest: ["john"] } })

            //then
            assert.deepStrictEqual(ret[0].toJSON(), { id: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined })
            assert.deepStrictEqual(ret[1].toJSON(), { id: 2, stringTest: 'clare', booleanTest: false, entityTest: undefined, entitiesTest: undefined })
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.where, { 'string_test': 'john' })
        })

        it('should return entities using foreing key', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true, fk_field: 21 },
                { id: 2, string_test: "clare", boolean_test: false, fk_field: null }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                foreignKeys: [{ fkField: String }],
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ where: { fkField: 1 } })

            //then
            assert.deepStrictEqual(ret[0].toJSON({ allowExtraKeys: true }), { id: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined, fkField: "21" })
            assert.deepStrictEqual(ret[1].toJSON({ allowExtraKeys: true }), { id: 2, stringTest: 'clare', booleanTest: false, entityTest: undefined, entitiesTest: undefined, fkField: null })
            assert.deepStrictEqual(spy.select, ['id', 'string_test', 'boolean_test', 'fk_field'])
            assert.deepStrictEqual(spy.where, 'fk_field')
            assert.deepStrictEqual(spy.value, [1])
        })


        it('should return error because a wrong search', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true, fk_field: 21 },
                { id: 2, string_test: "clare", boolean_test: false, fk_field: null }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            try {
                //when
                const ret = await itemRepo.find({ where: "wrong" })
            } catch (error) {
                //then
                assert.deepStrictEqual(error, "condition term is invalid")
            }
        })

        it('should return error because a type search', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { id: 1, string_test: "john", boolean_test: true, fk_field: 21 },
                { id: 2, string_test: "clare", boolean_test: false, fk_field: null }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)

            })

            try {
                //when
                const ret = await itemRepo.find({ where: { wrong: { wrong: "wrong" } } })
            } catch (error) {
                //then
                assert.deepStrictEqual(error, "condition value is invalid")
            }
        })
    })

})