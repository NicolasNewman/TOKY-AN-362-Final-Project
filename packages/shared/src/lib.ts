import { writeFile, appendFile } from 'fs/promises';
import { join } from 'path';

export const FILENAME = 'raw';

export const JSON_FILE = `${FILENAME}.json`;
export const JSON_PATH = join(__dirname, '../src/', JSON_FILE);
export const writeJSON = async (data: any) => await writeFile(JSON_PATH, JSON.stringify(data));

export const CSV_FILE = `${FILENAME}.csv`;
export const CSV_PATH = join(__dirname, '../src/', CSV_FILE);
export const writeCSV = async (mode: 'a' | 'w', data: string) =>
	mode === 'w' ? writeFile(CSV_PATH, data) : appendFile(CSV_PATH, data);
