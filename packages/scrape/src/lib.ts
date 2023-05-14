import { appendFile, writeFile } from 'fs/promises';

export const FILENAME = 'data';

export const CSV_NAME = `${FILENAME}.csv`;
export const writeCSV = async (content: string, mode: 'a' | 'w') =>
	mode === 'w' ? await writeFile(CSV_NAME, content) : await appendFile(CSV_NAME, content);

export const JSON_NAME = `${FILENAME}.json`;
export const writeJSON = async (content: any) => await writeFile(JSON_NAME, JSON.stringify(content));
