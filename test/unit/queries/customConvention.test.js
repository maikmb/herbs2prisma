const { entity, field } = require('@herbsjs/herbs')
const Repository = require('../../../src/repository')
const assert = require('assert')
const prisma = require('../connection')

describe('Custom Convention Repository', () => {
  context('Find all data with custom convention', () => {
    const retFromDeb = [
      { id: 1, string_test: 'john', boolean_test: true },
      { id: 2, string_test: 'clare', boolean_test: false }
    ]

    const givenAnEntity = () => {
      const ParentEntity = entity('A Parent Entity', {})

      return entity('A entity', {
        id: field(Number),
        stringTest: field(String),
        booleanTest: field(Boolean),
        entityTest: field(ParentEntity),
        entitiesTest: field([ParentEntity])
      })
    }

    const givenAnRepositoryClass = (_) => {
      return class ItemRepositoryBase extends Repository {
        constructor (options) {
          super(options)
        }
      }
    }   

    it('should return entities using custom conventions in repository', async () => {
      // given
      let spy = []
      const anEntity = givenAnEntity()
      const ItemRepository = givenAnRepositoryClass()

      const itemRepo = new ItemRepository({
        entity: anEntity,
        table: 'aTable',
        ids: ['id'],
        prisma: prisma(retFromDeb),
        convention: {
          toTableFieldName: fieldName => {
            spy.push(`${fieldName}_custom`)
            return fieldName
          }
        }
      })

      // when
      const ret = await itemRepo.find()

      // then
      assert.strictEqual(true, true)

      assert.strictEqual(ret.length, 2)
      assert.deepStrictEqual(spy, [
        'id_custom',
        'stringTest_custom',
        'booleanTest_custom',
        'entityTest_custom',
        'entitiesTest_custom'
      ])
    })

    it('should throw a error when convention failed', async () => {
      //given
      const anEntity = givenAnEntity()
      const ItemRepository = givenAnRepositoryClass()

      //when & then
      assert.throws(() => {
        new ItemRepository({
          entity: anEntity,
          table: 'aTable',
          ids: ['id'],
          prisma: prisma(retFromDeb),
          convention: {
            toTableFieldName: () => {
              throw new Error('Custom convention failed')
            }
          }
        })
      })
    })
  })
})
