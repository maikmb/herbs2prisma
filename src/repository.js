const { checker } = require('@herbsjs/suma')
const { BaseEntity } = require("@herbsjs/gotu/src/baseEntity")
const DataMapper = require('./dataMapper')
// const Convention = require('./convention')

module.exports = class Repository {
  constructor(options) {
    this.prisma = options.prisma
    this.table = options.table
    this.schema = options.schema
    this.entity = options.entity

    // this.convention = Object.assign(new Convention(), options.convention)
    this.entityIDs = this.#getEntityIds(options)
    this.foreignKeys = options.foreignKeys
    this.dataMapper = new DataMapper(
      this.entity,
      this.entityIDs,
      this.foreignKeys,
      options
    )
  }

  runner() {
    return this.prisma[this.table]
  }

  /** 
  *
  * Finds entities matching the ID condition.
  * 
  * @param {type}   ids The id or the array of id's to search
  * @return {type} List of entities
  */
  async findByID(ids) {
    const tableIDs = this.dataMapper.tableIDs()
    const tableFields = this.dataMapper.tableFields()

    const parsedValue = Array.isArray(ids) ? ids : [ids]
    const ret = await this.runner()
      .findMany({
        where: {
          [tableIDs[0]]: { in: parsedValue }
        }
      })
    // .select(tableFields)

    const entities = []

    for (const row of ret) {
      if (row === undefined) continue
      entities.push(this.dataMapper.toEntity(row))
    }

    return entities
  }

  /** 
*
* Finds entities matching the conditions.
* 
* @param {type}   object.limit Limit items to list  
* @param {type}   object.offset Rows that will be skipped from the resultset
* @param {type}   object.where Where query term
* @param {type}   object.orderBy Order by query
*
* @return {type} List of entities
*/
  async find(options = {
    limit: 0,
    offset: 0,
    orderBy: null,
    where: null
  }) {

    options.orderBy = options.orderBy || null
    options.limit = options.limit || 0
    options.offset = options.offset || 0
    options.where = options.where || null

    // const tableFields = this.dataMapper.tableFields()

    let query = this.runner()
    // .select(tableFields)

    // if (options.limit > 0) query = query.limit(options.limit)
    // if (options.offset > 0) query = query.offset(options.offset)

    return this.#executeFindQuery(query, options)
  }

  /** 
  *
  * Find all entities
  * 
  * @param {type}   object.limit Limit items to list  
  * @param {type}   object.orderBy Order by query
  * @param {type}   object.offset Rows that will be skipped from the resultset
  *
  * @return {type} List of entities
  */
  async findAll(options = {
    limit: 0,
    offset: 0,
    orderBy: null
  }) {

    const entities = this.find({ limit: options.limit, offset: options.offset, orderBy: options.orderBy })
    return entities
  }

  /** 
 *
 * Finds the first entity matching the conditions.
 * 
 * @param {type}   object.orderBy Order by query to get the first element of, if null will return the first element without order
 *
 * @return {type} Entity
 */
  async first(options = {
    orderBy: null,
    where: null
  }) {

    if (!checker.isEmpty(options.where)) this.#whereToTableFields(options.where)

    const tableFields = this.dataMapper.tableFields()

    let ret = await this.runner()
      .findUnique({
        where: options.where,
        // orderBy: options.orderBy
      })
    // .first(tableFields)

    return this.#resultToEntity(ret)
  }

  /** 
  *
  * Create a new entity
  * 
  * @param {type}   entityInstance Entity instance
  *
  * @return {type} Current entity
  */
  async insert(entityInstance) {
    const fields = this.dataMapper.tableFields()
    const payload = this.dataMapper.tableFieldsWithValue(entityInstance)

    const ret = await this.runner()
      // .returning(fields)
      .create({ data: payload })

    return this.dataMapper.toEntity(ret)

  }

  /** 
  *
  * Update entity
  * 
  * @param {type}   entityInstance Entity instance
  *
  * @return {type} Current entity
  */
  async update(entityInstance) {
    const tableIDs = this.dataMapper.tableIDs()
    const fields = this.dataMapper.tableFields()
    const payload = this.dataMapper.tableFieldsWithValue(entityInstance)

    const ret = await this.runner()
      // .returning(fields)
      .update({
        data: payload,
        where: { [tableIDs[0]]: entityInstance[tableIDs[0]] }
      })

    //.returning() is not supported by mysql or mysql2 and will not have any effect, update only return 1 to true or 0 to false
    if (this.runner().client && this.runner().client.driverName && this.runner().client.driverName.includes('mysql'))
      return ret === 1

    return this.dataMapper.toEntity(ret)
  }

  /** 
  *
  * Delete entity
  * 
  * @param {type} entityInstance Entity instance
  *
  * @return {type} True when success
  */
  async delete(entityInstance) {
    const tableIDs = this.dataMapper.tableIDs()

    const ret = await this.runner()
      // .where(tableIDs[0], entityInstance[tableIDs[0]])
      .delete({
        where: {
          [tableIDs[0]]: entityInstance[tableIDs[0]]
        }
      })

    return ret === 1
  }

  async #executeFindQuery(query, options) {
    this.#whereToTableFields(options.where)

    const ret = await query.findMany()
    return this.#resultToEntity(ret)
  }

  #whereToTableFields(conditions) {
    if (!checker.isEmpty(conditions)) {

      Object.keys(conditions).map((key) => {
        if (checker.isEmpty(conditions[key])) {
          delete conditions[key]
        }

        const conditionTermTableField = this.dataMapper.toTableFieldName(key)
        if (!key || key === "0") throw "condition term is invalid"

        const conditionValue = Array.isArray(conditions[key])
          ? conditions[key]
          : [conditions[key]]

        if (!conditions[key] ||
          (typeof conditions[key] === "object" && !Array.isArray(conditions[key])) ||
          (Array.isArray(conditions[key]) && !conditions[key].length))
          throw "condition value is invalid"

        delete conditions[key]
        // conditions[conditionTermTableField] = { in: conditionValue }
        conditions[conditionTermTableField] = conditionValue[0]
      })
    }
  }

  #resultToEntity(ret) {
    const entities = []

    if (!checker.isDefined(ret)) {
      return entities
    }

    if (checker.isIterable(ret)) {
      for (const row of ret) {
        if (row === undefined) continue
        entities.push(this.dataMapper.toEntity(row))
      }
    } else {
      entities.push(this.dataMapper.toEntity(ret))
    }

    return entities

  }

  #getEntityIds({ entity, ids }) {
    if (ids) return ids

    if (entity && entity.prototype instanceof BaseEntity) {
      const fields = Object.values(entity.prototype.meta.schema)
      const idFields = fields.filter(({ options }) => options.isId)
      const idFieldsNames = idFields.map(({ name }) => name)

      return idFieldsNames
    }

    return []
  }
}
