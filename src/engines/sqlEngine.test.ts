import { describe, expect, it } from 'vitest'
import {
  dropDatabaseTables,
  executeRedisCommand,
  explainQuery,
  getTablePreview,
  importTableFromJSON,
  parseCSV,
  preprocessSQL,
} from './sqlEngine'

describe('preprocessSQL', () => {
  it('convierte SQL Server a una sintaxis compatible con el simulador', () => {
    const result = preprocessSQL(`
      CREATE DATABASE Tienda;
      GO
      USE [Tienda];
      SET ANSI_NULLS ON;
      CREATE TABLE [dbo].[Clientes] (
        [id] INT PRIMARY KEY IDENTITY(1,1),
        [nombre] NVARCHAR(100) NOT NULL,
        [activo] BIT DEFAULT 1,
        CONSTRAINT FK_Cliente FOREIGN KEY (id) REFERENCES Otra(id)
      );
    `)

    expect(result.dbName).toBe('Tienda')
    expect(result.skipped).toContain('CREATE DATABASE')
    expect(result.processed).not.toMatch(/\bGO\b|USE \[?Tienda\]?|ANSI_NULLS/i)
    expect(result.processed).toContain('id INT AUTOINCREMENT PRIMARY KEY')
    expect(result.processed).toContain('nombre VARCHAR(100)')
    expect(result.processed).toContain('activo INT')
    expect(result.processed).not.toMatch(/FOREIGN KEY|CONSTRAINT/i)
  })
})

describe('parseCSV', () => {
  it('lee comas y comillas escapadas dentro de campos', () => {
    const rows = parseCSV('id,nombre,nota\n1,"Ana, QA","dijo ""ok"""')

    expect(rows).toEqual([
      { id: '1', nombre: 'Ana, QA', nota: 'dijo "ok"' },
    ])
  })

  it('devuelve una lista vacia cuando no hay filas de datos', () => {
    expect(parseCSV('id,nombre')).toEqual([])
  })
})

describe('importTableFromJSON', () => {
  it('crea una tabla desde un objeto JSON y permite previsualizar sus datos', () => {
    importTableFromJSON('clientes_json_test', '{"id":1,"nombre":"Ana","activo":true}')

    const preview = getTablePreview('clientes_json_test')

    expect(preview.rowCount).toBe(1)
    expect(preview.columns).toEqual(['id', 'nombre', 'activo'])
    expect(preview.rows[0]).toEqual({ id: 1, nombre: 'Ana', activo: true })

    dropDatabaseTables(['clientes_json_test'])
  })
})

describe('explainQuery', () => {
  it('genera un plan para SELECT con filtro, orden y limite', () => {
    importTableFromJSON('ventas_plan_test', JSON.stringify([
      { id: 1, cliente: 'Ana', total: 80 },
      { id: 2, cliente: 'Luis', total: 45 },
      { id: 3, cliente: 'Rosa', total: 120 },
    ]))

    const steps = explainQuery(`
      SELECT cliente, total
      FROM ventas_plan_test
      WHERE total > 50
      ORDER BY total DESC
      LIMIT 2
    `)

    expect(steps.map((step) => step.type)).toEqual([
      'scan',
      'filter',
      'sort',
      'limit',
      'projection',
    ])
    expect(steps[0]).toMatchObject({
      operation: 'SEQ SCAN',
      table: 'ventas_plan_test',
      estimatedRows: 3,
    })
    expect(steps.at(-1)).toMatchObject({
      operation: 'PROJECTION',
      estimatedRows: 1,
    })

    dropDatabaseTables(['ventas_plan_test'])
  })
})

describe('executeRedisCommand', () => {
  it('ejecuta comandos basicos de string', () => {
    executeRedisCommand('FLUSHDB')

    const setResult = executeRedisCommand('SET curso calidad')
    const getResult = executeRedisCommand('GET curso')
    const existsResult = executeRedisCommand('EXISTS curso')

    expect(setResult.rows[0]).toMatchObject({ resultado: 'OK' })
    expect(getResult.rows[0]).toMatchObject({ resultado: 'calidad' })
    expect(existsResult.rows[0]).toMatchObject({ resultado: '(integer) 1' })
  })

  it('maneja hashes, listas y conjuntos', () => {
    executeRedisCommand('FLUSHDB')

    const result = executeRedisCommand(`
      HSET usuario:1 nombre Abel rol tester
      HGET usuario:1 rol
      RPUSH cola tarea1 tarea2
      LRANGE cola 0 -1
      SADD tags sql nosql sql
      SCARD tags
    `)

    expect(result.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resultado: '(integer) 2' }),
        expect.objectContaining({ resultado: 'tester' }),
        expect.objectContaining({ valor: 'tarea1' }),
        expect.objectContaining({ valor: 'tarea2' }),
        expect.objectContaining({ resultado: '(integer) 2' }),
      ]),
    )
  })
})
