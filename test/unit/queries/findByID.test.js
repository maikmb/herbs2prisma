const { entity, field, id } = require('@herbsjs/herbs')
const Repository = require('../../../src/repository')
const assert = require('assert')
const prisma = require('../connection')

describe('Query Find by ID', () => {

    const givenAnEntity = () => {
        const ParentEntity = entity('A Parent Entity', {})

        return entity('A entity', {
            anId: id(Number),
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

    it('should return entities instances instance', async () => {
        //given
        let spy = {}
        const retFromDeb = [
            { an_id: 1, string_test: "john", boolean_test: true },
            { an_id: 2, string_test: "clare", boolean_test: false }
        ]
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass()
        const itemRepo = new ItemRepository({
            entity: anEntity,
            table: 'aTable',
            prisma: prisma(retFromDeb, spy)
        })

        //when
        const ret = await itemRepo.findByID(1)

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { anId: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined })
        assert.deepStrictEqual(ret[1].toJSON(), { anId: 2, stringTest: 'clare', booleanTest: false, entityTest: undefined, entitiesTest: undefined })
        assert.deepStrictEqual(spy.select, { 'an_id': true, 'string_test': true, 'boolean_test': true })
        assert.deepStrictEqual(spy.where, { 'an_id': 1 })
    })

    it('should return entities for multiples primary key', async () => {
        //given
        let spy = {}
        const retFromDeb = [
            { an_id: 1, string_test: "john", boolean_test: true },
            { an_id: 2, string_test: "clare", boolean_test: false }
        ]
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass()
        const itemRepo = new ItemRepository({
            entity: anEntity,
            table: 'aTable',
            prisma: prisma(retFromDeb, spy)
        })

        //when
        const ret = await itemRepo.findByID([1, 2])

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { anId: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined })
        assert.deepStrictEqual(ret[1].toJSON(), { anId: 2, stringTest: 'clare', booleanTest: false, entityTest: undefined, entitiesTest: undefined })
        assert.deepStrictEqual(spy.select, { 'an_id': true, 'string_test': true, 'boolean_test': true })
        assert.deepStrictEqual(spy.where, { 'an_id': { in: [1, 2] } })
    })

    it('should return entities instances with foreing key', async () => {
        //given
        let spy = {}
        const retFromDeb = [
            { an_id: 1, string_test: "john", boolean_test: true, fk_field: 21 },
            { an_id: 2, string_test: "clare", boolean_test: false, fk_field: null }
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
        const ret = await itemRepo.findByID(1)

        //then
        assert.deepStrictEqual(ret[0].toJSON({ allowExtraKeys: true }), { anId: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined, fkField: "21" })
        assert.deepStrictEqual(ret[1].toJSON({ allowExtraKeys: true }), { anId: 2, stringTest: 'clare', booleanTest: false, entityTest: undefined, entitiesTest: undefined, fkField: null })
        assert.deepStrictEqual(spy.select, { 'an_id': true, 'string_test': true, 'boolean_test': true, 'fk_field': true })
        assert.deepStrictEqual(spy.where, { 'an_id': 1 })
    })
})