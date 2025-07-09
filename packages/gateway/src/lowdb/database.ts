import type { Adapter } from 'lowdb'
import type { DataBase } from './schema.js'
import fs from 'node:fs'
import { dirname as pathDirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { Low, Memory } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { createDefaultData } from './schema.js'

const isTest = process.env.NODE_ENV === 'test'

const dirname = isTest ? '/mock/path' : pathDirname(fileURLToPath(import.meta.url))
const packagesIndex = dirname.indexOf('packages')
const appsIndex = dirname.indexOf('apps')

const rootIndex = packagesIndex > 0 ? packagesIndex : appsIndex > 0 ? appsIndex : undefined
if (!isTest && rootIndex === undefined) {
  throw new Error('DB path not found')
}

const basePath = dirname.slice(0, rootIndex)
const dbFilePath = `${basePath}/db.json`

const adapter: Adapter<DataBase> = isTest ? new Memory<DataBase>() : new JSONFile<DataBase>(dbFilePath)
const db = new Low<DataBase>(adapter, createDefaultData())
const dbFileExists = () => fs.existsSync(dbFilePath)

async function createDb() {
  await db.write()
}

async function resetDb() {
  const newDb = new Low<DataBase>(adapter, createDefaultData())
  await newDb.write()
}

export { adapter, createDb, db, dbFileExists, dirname, resetDb }
