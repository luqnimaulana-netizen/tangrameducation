/**
 * Netlify Serverless Function: submit-reflection
 * Receives validated student reflection payload and forwards it to Google Sheets Apps Script Web App.
 * Environment variables configured in Netlify:
 * - GOOGLE_SHEETS_WEBHOOK_URL: URL Web App Google Apps Script (ending in /exec)
 * - GOOGLE_SHEETS_WEBHOOK_SECRET: Optional secret token verified by the Apps Script
 */

declare const process: {
  env: Record<string, string | undefined>;
};

interface HandlerEvent {
  httpMethod: string;
  body: string | null;
}

interface HandlerResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ synced: false, status: 'failed', message: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as {
      id?: string;
      createdAt?: string;
      studentName?: string;
      studentClass?: string;
      feeling?: string;
      feelingLabel?: string;
      message?: string;
      source?: string;
    };

    const studentName = String(payload.studentName || '').trim();
    const studentClass = String(payload.studentClass || '').trim();
    const feeling = String(payload.feeling || '').trim();
    const message = String(payload.message || '').trim();

    if (!studentName || !studentClass || (feeling !== 'seru' && feeling !== 'bosan')) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          synced: false,
          status: 'failed',
          message: 'Payload refleksi tidak valid (Nama, Kelas, dan Ekspresi wajib diisi).',
        }),
      };
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '';

    if (!webhookUrl) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          synced: false,
          status: 'pending',
          message:
            'GOOGLE_SHEETS_WEBHOOK_URL belum diatur di Environment Variables Netlify. Data tetap aman di Firestore.',
        }),
      };
    }

    const sheetPayload = {
      secret: webhookSecret,
      id: payload.id || `ref_${Date.now()}`,
      createdAt: payload.createdAt || new Date().toISOString(),
      studentName,
      studentClass,
      feeling: payload.feelingLabel || (feeling === 'seru' ? 'Seru Banget!' : 'Bosan!'),
      message: message || '-',
      source: payload.source || 'bangun-datar-adventure-v2',
      syncStatus: 'synced',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetPayload),
    });

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          synced: false,
          status: 'failed',
          message: `Google Apps Script merespons HTTP ${response.status}.`,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        synced: true,
        status: 'synced',
        message: 'Berhasil dikirim ke Google Sheets.',
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        synced: false,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Kesalahan internal fungsi serverless.',
      }),
    };
  }
};
