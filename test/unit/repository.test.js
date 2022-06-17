const { entity, field, id } = require('@herbsjs/herbs')
const Repository = require('../../src/repository')
const assert = require('assert')
const Convention = require('../../src/convention')
const prisma = require('./connection')

describe('Repository', () => {
  const EmptyEntity = entity('Empty', {})

  context('Repository constructor', () => {
    it('should use the default convention when no convention is specified', () => {
      const repositoryInstance = new Repository({
        entity: EmptyEntity,
      })

      assert.deepEqual(repositoryInstance.convention, new Convention())
    })

    it('should use custom convention when it is specified', () => {
      const customConvention = {
        doSomething() {}
      }

      const repositoryInstance = new Repository({
        entity: EmptyEntity,
        convention: customConvention,
      })

      assert.equal(repositoryInstance.convention.doSomething, customConvention.doSomething)
    })

    it('should use the specified table', () => {
      const tableName = 'my_sql_table'

      const repositoryInstance = new Repository({
        entity: EmptyEntity,
        table: tableName,
      })

      assert.equal(repositoryInstance.table, tableName)
    })   

    it('should use the specified entity', () => {
      const repositoryInstance = new Repository({
        entity: EmptyEntity,
      })

      assert.equal(repositoryInstance.entity, EmptyEntity)
    })

    it('should use the specified ids', () => {
      const ids = ['id']

      const repositoryInstance = new Repository({
        entity: EmptyEntity,
        ids,
      })

      assert.equal(repositoryInstance.entityIDs, ids)
    })

    it('should find the entity ids when no id is specified', () => {
      const EntityWithIds = entity('EntityWithId', {
        first: field(Number, { isId: true }),
        second: id(Number),
      })

      const repositoryInstance = new Repository({
        entity: EntityWithIds,
      })

      assert.deepEqual(repositoryInstance.entityIDs, ['first', 'second'])
    })

    it('should set ids to empty array when no id is specified and the entity has no field set as the entity id', () => {
      const EntityWithoutIds = entity('EntityWithoutIds', {
        notId: field(Number),
      })

      const repositoryInstance = new Repository({
        entity: EntityWithoutIds,
      })

      assert.deepEqual(repositoryInstance.entityIDs, [])
    })

    it('should use the specified foreign keys', () => {
      const foreignKeys = ['another_table_id']

      const repositoryInstance = new Repository({
        entity: EmptyEntity,
        foreignKeys,
      })

      assert.equal(repositoryInstance.foreignKeys, foreignKeys)
    })

    it('should use the specified knex instance', () => {
      const prisma = {}

      const repositoryInstance = new Repository({
        entity: EmptyEntity,
        prisma: prisma,
      })

      assert.equal(repositoryInstance.prisma, prisma)
    })
  })
})
