const { entity, field, id } = require('@herbsjs/herbs')
const Repository = require('../../../src/repository')
const assert = require('assert')
const prisma = require('../connection')

describe('Query First', () => {

    context('Find first data', () => {

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

        it('should return entity using table field', async () => {
            //given
            let spy = {}
            const retFromDeb =
                [{ id: 1, string_test: "john", boolean_test: true }]

            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                table: 'aTable',
                prisma: prisma(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.first()

            //then
            assert.strictEqual(ret.length, 1)
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
            const ret = await itemRepo.first({ orderBy: 'stringTest' })

            //then
            assert.strictEqual(ret.length, 1)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.orderBy, { stringTest: 'asc' })
        })

        it('should return when order by is complex', async () => {
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
            const ret = await itemRepo.first({ orderBy: [{ string_test: 'desc' }, 'id'] })

            //then
            assert.strictEqual(ret.length, 1)
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.orderBy[0], { string_test: 'desc' })
            assert.deepStrictEqual(spy.orderBy[1], { id: 'asc' })

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
                const ret = await itemRepo.first({ orderBy: {} })
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
            const ret = await itemRepo.first({ where: { stringTest: ["john"] } })

            //then
            assert.deepStrictEqual(ret[0].toJSON(), { id: 1, stringTest: 'john', booleanTest: true, entityTest: undefined, entitiesTest: undefined })
            assert.deepStrictEqual(spy.select, { 'id': true, 'string_test': true, 'boolean_test': true })
            assert.deepStrictEqual(spy.where, { 'string_test': { in: ["john"] } })
        })

    })


})