const assert = require('assert')
const { entity, field, id } = require('@herbsjs/herbs')
const Repository = require('../../../src/repository')
const connection = require('../connection')
const db = require('./db')


describe('Query Find', () => {

    const table = 'Sample'
    const schema = 'public'

    before(async () => {
        const sql = `
        DROP SCHEMA IF EXISTS ${schema} CASCADE;
        CREATE SCHEMA ${schema};
        DROP TABLE IF EXISTS ${schema}."${table}" CASCADE; 
        CREATE TABLE ${schema}."${table}" (
            id INT,
            string_test TEXT,
            boolean_test BOOL
        )`
        await db.query(sql)

        await db.query(`INSERT INTO ${schema}."${table}" (id, string_test, boolean_test) VALUES (10, 'marie', true)`)
    })

    after(async () => {
        const sql = `
            DROP SCHEMA IF EXISTS ${schema} CASCADE;
        `
        await db.query(sql)
    })

    const givenAnRepositoryClass = (options) => {
        return class ItemRepositoryBase extends Repository {
            constructor() {
                super(options)
            }
        }
    }

    const givenAnEntity = () => {
        return entity('A entity', {
            id: id(Number),
            stringTest: field(String),
            booleanTest: field(Boolean)
        })
    }

    it('should return entities', async () => {
        //given
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            table,
            schema,
            prisma: connection
        })
        const injection = {}
        const itemRepo = new ItemRepository(injection)

        //when
        const ret = await itemRepo.find({ where: { stringTest: ["marie"] } })

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { id: 10, stringTest: 'marie', booleanTest: true })
    })
})