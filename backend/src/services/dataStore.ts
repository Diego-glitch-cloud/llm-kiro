import * as fs from 'fs';
import * as path from 'path';
import { DataStore } from '../types/index';

const DATA_FILE_PATH = path.join(__dirname, '../../data.json');

export let dataStore: DataStore = { games: [], orders: [] };

export function loadDataStore(): DataStore {
  const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  dataStore = JSON.parse(raw) as DataStore;
  return dataStore;
}

export function saveDataStore(newData: DataStore): void {
  const snapshot = dataStore;
  dataStore = newData;
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(newData, null, 2), 'utf-8');
  } catch (err) {
    dataStore = snapshot;
    const error = new Error('Internal server error: failed to persist data') as Error & { status: number };
    error.status = 500;
    throw error;
  }
}
