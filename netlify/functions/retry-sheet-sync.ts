/**
 * Netlify Serverless Function: retry-sheet-sync
 * Retries sending a previously pending/failed reflection entry from the Teacher Dashboard to Google Sheets.
 */

import { handler as submitHandler } from './submit-reflection';

export const handler = submitHandler;
