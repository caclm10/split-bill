import { openDB, type DBSchema } from 'idb'
import type { BillState } from './types'

export interface BillRecord {
  id: string
  date: string
  billName: string
  grandTotal: number
  state: BillState
  createdAt: number
}

interface SplitBillDB extends DBSchema {
  bills: {
    key: string
    value: BillRecord
    indexes: { 'by-created-at': number }
  }
}

const DB_NAME = 'spbill-db'
const DB_VERSION = 1
const STORE_NAME = 'bills'

async function initDB() {
  return openDB<SplitBillDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-created-at', 'createdAt')
      }
    },
  })
}

export async function saveBill(record: BillRecord): Promise<void> {
  const db = await initDB()
  await db.put(STORE_NAME, record)
}

export async function getAllBills(): Promise<BillRecord[]> {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const index = tx.store.index('by-created-at')
  
  // Get all records ordered by createdAt
  const records = await index.getAll()
  
  // Sort descending manually (idb getAll returns ascending)
  return records.reverse()
}

export async function deleteBill(id: string): Promise<void> {
  const db = await initDB()
  await db.delete(STORE_NAME, id)
}
