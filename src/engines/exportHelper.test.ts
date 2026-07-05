import { describe, expect, it, vi } from 'vitest'
import { generateEngineExport } from './exportHelper'
import type { SchemaEntry } from '../db/idbStorage'
import type { TableInfo } from './sqlEngine'

const schema: SchemaEntry = {
  dbName: 'Tienda',
  tableOrder: ['clientes'],
  createStatements: {
    clientes: `CREATE TABLE [clientes] (
      [id] INT IDENTITY(1,1) PRIMARY KEY,
      [nombre] NVARCHAR(100)
    );`,
  },
  identityCols: {
    clientes: 'id',
  },
  insertCols: {
    clientes: ['nombre'],
  },
}

const tables: TableInfo[] = [
  { name: 'clientes', rowCount: 2, columns: ['id', 'nombre'] },
]

const getData = () => ({
  columns: ['id', 'nombre'],
  rows: [
    { id: 1, nombre: 'Ana' },
    { id: 2, nombre: "O'Neil" },
  ],
})

describe('generateEngineExport', () => {
  it('genera SQL compatible con MySQL respetando columnas identity', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-04T08:00:00.000Z'))

    const result = generateEngineExport('mysql', 'Tienda', schema, ['clientes'], tables, getData)

    expect(result.filename).toBe('Tienda_mysql.sql')
    expect(result.content).toContain('CREATE DATABASE IF NOT EXISTS `Tienda`')
    expect(result.content).toContain('CREATE TABLE `clientes`')
    expect(result.content).toContain('AUTO_INCREMENT')
    expect(result.content).toContain('INSERT INTO `clientes` (`nombre`) VALUES')
    expect(result.content).toContain("('O''Neil');")
  })

  it('genera scripts de MongoDB con insertMany', () => {
    const result = generateEngineExport('mongodb', 'Tienda', schema, ['clientes'], tables, getData)

    expect(result.filename).toBe('Tienda_mongodb.js')
    expect(result.content).toContain("use('Tienda');")
    expect(result.content).toContain("db.createCollection('clientes');")
    expect(result.content).toContain('db.clientes.insertMany(')
  })

  it('genera comandos Redis con hashes por fila', () => {
    const result = generateEngineExport('redis', 'Tienda', schema, ['clientes'], tables, getData)

    expect(result.filename).toBe('Tienda_redis.txt')
    expect(result.content).toContain('HSET clientes:1 id 1')
    expect(result.content).toContain('HSET clientes:2 nombre "O\'Neil"')
  })
})
