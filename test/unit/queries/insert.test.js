const { entity, field, id } = require("@herbsjs/gotu")
const Repository = require("../../../src/repository")
const assert = require("assert")
const prisma = require("../connection")

describe("Insert an Entity", () => {
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


  it("should insert an entity", async () => {
    //given
    let spy = {}
    const retFromDeb = { id: 1 }
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const itemRepo = new ItemRepository({
      entity: anEntity,
      table: "aTable",
      prisma: prisma(retFromDeb, spy)
    })

    anEntity.id = 2
    anEntity.stringTest = "test"
    anEntity.booleanTest = true

    //when
    const ret = await itemRepo.insert(anEntity)

    //then
    assert.deepStrictEqual(ret.id, 1)
    assert.deepStrictEqual(spy.data, { id: 2, string_test: 'test', boolean_test: true })
  })

  it("should insert an entity with foreign key", async () => {
    //given
    let spy = {}
    const retFromDeb = { id: 2 }
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const itemRepo = new ItemRepository({
      entity: anEntity,
      table: "aTable",
      foreignKeys: [{ fkField: String }],
      prisma: prisma(retFromDeb, spy)
    })

    anEntity.id = 2
    anEntity.stringTest = "test"
    anEntity.booleanTest = true
    anEntity.fkField = 42

    //when
    const ret = await itemRepo.insert(anEntity)

    //then
    assert.deepStrictEqual(ret.id, 2)
    assert.deepStrictEqual(spy.data, { id: 2, string_test: 'test', boolean_test: true, fk_field: 42 })
  })
})
