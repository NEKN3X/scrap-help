import type { Documents } from '@/lowdb/index.js'
import { Low } from 'lowdb'
import { adapter, createDefaultData } from '@/lowdb/index.js'

export async function setupDataBase(): Promise<Low<Documents>> {
  const db = new Low(adapter, createDefaultData())
  await db.read()
  db.data = createDefaultData()
  await db.write()
  return db
}
