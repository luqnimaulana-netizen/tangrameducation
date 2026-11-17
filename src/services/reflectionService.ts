import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ReflectionEntry, ReflectionSyncStatus } from '../types/app';
import {
  generateReflectionId,
  validateReflectionInput,
} from '../utils/gameLogic';

export const REFLECTION_SOURCE_ID = 'bangun-datar-adventure-v2';

export interface SubmitReflectionOutcome {
  entry: ReflectionEntry;
  savedToFirestore: boolean;
  syncedToSheets: boolean;
  syncStatus: ReflectionSyncStatus;
  userFacingMessage: string;
  errorDetail?: string;
}

/**
 * Attempts to forward a reflection entry to Google Sheets via Netlify Function
 * (`/.netlify/functions/submit-reflection`) or optional `VITE_GOOGLE_SHEETS_WEBHOOK_URL`.
 */
export async function syncReflectionToGoogleSheets(
  entry: ReflectionEntry,
  isRetry = false
): Promise<{ ok: boolean; status: ReflectionSyncStatus; error?: string }> {
  const directWebhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined;

  // In local Vite dev mode (without Netlify CLI), if no direct webhook URL is configured,
  // avoid triggering a 404 on /.netlify/functions/* and report pending status cleanly.
  if (import.meta.env.DEV && (!directWebhookUrl || !directWebhookUrl.startsWith('https://'))) {
    return {
      ok: false,
      status: 'pending',
      error:
        'GOOGLE_SHEETS_WEBHOOK_URL belum dikonfigurasi pada environment lokal. Data telah tersimpan aman di Cloud Firestore.',
    };
  }

  const endpoint = isRetry
    ? '/.netlify/functions/retry-sheet-sync'
    : '/.netlify/functions/submit-reflection';

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 7000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: entry.id,
        createdAt: entry.createdAt,
        studentName: entry.studentName,
        studentClass: entry.studentClass,
        feeling: entry.feeling,
        feelingLabel: entry.feeling === 'seru' ? 'Seru Banget!' : 'Bosan!',
        message: entry.message,
        source: entry.source,
      }),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = (await response.json().catch(() => ({}))) as {
        synced?: boolean;
        status?: ReflectionSyncStatus;
        message?: string;
      };
      if (data.synced === true || data.status === 'synced') {
        return { ok: true, status: 'synced' };
      }
      return {
        ok: false,
        status: data.status || 'pending',
        error: data.message || 'Endpoint Google Sheets belum dikonfigurasi.',
      };
    }

    // Fallback: if running in pure Vite dev mode without Netlify CLI and VITE_GOOGLE_SHEETS_WEBHOOK_URL is set
    const directWebhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined;
    if (directWebhookUrl && directWebhookUrl.startsWith('https://')) {
      const directResp = await fetch(directWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: entry.id,
          createdAt: entry.createdAt,
          studentName: entry.studentName,
          studentClass: entry.studentClass,
          feeling: entry.feeling === 'seru' ? 'Seru Banget!' : 'Bosan!',
          message: entry.message,
          source: entry.source,
          syncStatus: 'synced',
        }),
      });
      if (directResp.ok) {
        return { ok: true, status: 'synced' };
      }
    }

    return {
      ok: false,
      status: 'pending',
      error: `Sinkronisasi Google Sheets tertunda (HTTP ${response.status}).`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'pending',
      error:
        err instanceof Error
          ? err.message.slice(0, 200)
          : 'Koneksi ke endpoint Google Sheets tertunda.',
    };
  }
}

/**
 * Submits a student reflection:
 * 1. Validates and sanitizes inputs.
 * 2. Saves to Cloud Firestore (/reflections/{id}) with serverTimestamp().
 * 3. Sends to Google Sheets via serverless function and updates syncStatus in Firestore.
 */
export async function submitStudentReflection(input: {
  studentName: string;
  studentClass: string;
  feeling: 'seru' | 'bosan' | null;
  message: string;
}): Promise<SubmitReflectionOutcome> {
  const validation = validateReflectionInput(input);
  if (!validation.valid || !input.feeling) {
    const firstError =
      validation.errors.studentName ||
      validation.errors.studentClass ||
      validation.errors.feeling ||
      validation.errors.message ||
      'Data refleksi belum lengkap.';
    throw new Error(firstError);
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const reflectionId = generateReflectionId(
    validation.sanitizedName,
    validation.sanitizedClass,
    input.feeling,
    nowMs
  );

  const initialEntry: ReflectionEntry = {
    id: reflectionId,
    studentName: validation.sanitizedName,
    studentClass: validation.sanitizedClass,
    feeling: input.feeling,
    message: validation.sanitizedMessage,
    createdAt: nowIso,
    createdAtTimestamp: nowMs,
    source: REFLECTION_SOURCE_ID,
    syncStatus: 'pending',
  };

  let savedToFirestore = false;
  let firestoreErrorMsg: string | undefined;

  try {
    const docRef = doc(db, 'reflections', reflectionId);
    await setDoc(docRef, {
      id: initialEntry.id,
      studentName: initialEntry.studentName,
      studentClass: initialEntry.studentClass,
      feeling: initialEntry.feeling,
      message: initialEntry.message,
      createdAt: initialEntry.createdAt,
      createdAtTimestamp: initialEntry.createdAtTimestamp,
      serverCreatedAt: serverTimestamp(),
      source: initialEntry.source,
      syncStatus: 'pending',
    });
    savedToFirestore = true;
  } catch (error) {
    const info = handleFirestoreError(error, OperationType.CREATE, `reflections/${reflectionId}`);
    firestoreErrorMsg = info.error;
  }

  // Attempt Google Sheets synchronization
  const sheetResult = await syncReflectionToGoogleSheets(initialEntry, false);
  const finalSyncStatus: ReflectionSyncStatus = sheetResult.ok ? 'synced' : sheetResult.status;
  const syncedAtIso = sheetResult.ok ? new Date().toISOString() : undefined;

  if (savedToFirestore) {
    try {
      const docRef = doc(db, 'reflections', reflectionId);
      const updatePayload: Record<string, string> = {
        syncStatus: finalSyncStatus,
      };
      if (syncedAtIso) {
        updatePayload.sheetSyncedAt = syncedAtIso;
      }
      if (sheetResult.error) {
        updatePayload.lastSyncError = sheetResult.error.slice(0, 280);
      }
      await updateDoc(docRef, updatePayload);
    } catch {
      // Non-fatal if status update is skipped
    }
  }

  const finalEntry: ReflectionEntry = {
    ...initialEntry,
    syncStatus: finalSyncStatus,
    sheetSyncedAt: syncedAtIso,
    lastSyncError: sheetResult.error,
  };

  // Determine exact required user-facing message per Feature 3 specification
  let userFacingMessage: string;
  if (savedToFirestore && sheetResult.ok) {
    userFacingMessage =
      'Refleksimu berhasil dikirim ke Dashboard Guru dan Google Sheets.';
  } else if (savedToFirestore && !sheetResult.ok) {
    userFacingMessage =
      'Refleksimu berhasil disimpan di Dashboard Guru, tetapi sinkronisasi ke Google Sheets sedang tertunda.';
  } else {
    userFacingMessage =
      'Refleksi belum berhasil dikirim ke server. Periksa koneksi internetmu lalu coba lagi.';
  }

  return {
    entry: finalEntry,
    savedToFirestore,
    syncedToSheets: sheetResult.ok,
    syncStatus: finalSyncStatus,
    userFacingMessage,
    errorDetail: firestoreErrorMsg || sheetResult.error,
  };
}

/**
 * Retries syncing an existing reflection entry to Google Sheets from the Teacher Dashboard
 * and updates its syncStatus in Firestore.
 */
export async function retryReflectionSheetSync(
  entry: ReflectionEntry
): Promise<{ ok: boolean; updatedEntry: ReflectionEntry; message: string }> {
  const result = await syncReflectionToGoogleSheets(entry, true);
  const newStatus: ReflectionSyncStatus = result.ok ? 'synced' : 'failed';
  const syncedAt = result.ok ? new Date().toISOString() : entry.sheetSyncedAt;
  const lastSyncError = result.ok ? '' : (result.error || 'Gagal menghubungi webhook Google Sheets').slice(0, 280);

  try {
    const docRef = doc(db, 'reflections', entry.id);
    const payload: Record<string, string> = {
      syncStatus: newStatus,
      lastSyncError,
    };
    if (syncedAt) {
      payload.sheetSyncedAt = syncedAt;
    }
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reflections/${entry.id}`);
  }

  const updatedEntry: ReflectionEntry = {
    ...entry,
    syncStatus: newStatus,
    sheetSyncedAt: syncedAt,
    lastSyncError: lastSyncError || undefined,
  };

  return {
    ok: result.ok,
    updatedEntry,
    message: result.ok
      ? `Refleksi ${entry.studentName} berhasil disinkronkan ke Google Sheets.`
      : `Sinkronisasi Google Sheets belum berhasil: ${lastSyncError}`,
  };
}

/**
 * Subscribes to live reflections in Firestore for the authenticated Teacher Dashboard.
 * Includes the mandatory `where('source', '==', 'bangun-datar-adventure-v2')` filter matching `firestore.rules`.
 */
export function subscribeToTeacherReflections(
  onData: (entries: ReflectionEntry[]) => void,
  onError: (errMessage: string) => void
): Unsubscribe {
  const q = query(
    collection(db, 'reflections'),
    where('source', '==', REFLECTION_SOURCE_ID),
    orderBy('createdAtTimestamp', 'desc'),
    limit(500)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReflectionEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id || docSnap.id),
          studentName: String(d.studentName || ''),
          studentClass: String(d.studentClass || ''),
          feeling: d.feeling === 'bosan' ? 'bosan' : 'seru',
          message: String(d.message || ''),
          createdAt: String(d.createdAt || ''),
          createdAtTimestamp: Number(d.createdAtTimestamp || 0),
          source: String(d.source || REFLECTION_SOURCE_ID),
          syncStatus:
            d.syncStatus === 'synced' || d.syncStatus === 'failed'
              ? d.syncStatus
              : 'pending',
          sheetSyncedAt: d.sheetSyncedAt ? String(d.sheetSyncedAt) : undefined,
          lastSyncError: d.lastSyncError ? String(d.lastSyncError) : undefined,
        };
      });
      onData(items);
    },
    (error) => {
      const info = handleFirestoreError(error, OperationType.LIST, 'reflections');
      onError(info.error);
    }
  );
}

/**
 * One-time fetch of reflections for manual refresh on Teacher Dashboard.
 */
export async function fetchTeacherReflections(): Promise<ReflectionEntry[]> {
  const q = query(
    collection(db, 'reflections'),
    where('source', '==', REFLECTION_SOURCE_ID),
    orderBy('createdAtTimestamp', 'desc'),
    limit(500)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const d = docSnap.data();
    return {
      id: String(d.id || docSnap.id),
      studentName: String(d.studentName || ''),
      studentClass: String(d.studentClass || ''),
      feeling: d.feeling === 'bosan' ? 'bosan' : 'seru',
      message: String(d.message || ''),
      createdAt: String(d.createdAt || ''),
      createdAtTimestamp: Number(d.createdAtTimestamp || 0),
      source: String(d.source || REFLECTION_SOURCE_ID),
      syncStatus:
        d.syncStatus === 'synced' || d.syncStatus === 'failed'
          ? d.syncStatus
          : 'pending',
      sheetSyncedAt: d.sheetSyncedAt ? String(d.sheetSyncedAt) : undefined,
      lastSyncError: d.lastSyncError ? String(d.lastSyncError) : undefined,
    };
  });
}

/**
 * Generates a UTF-8 BOM CSV string from filtered reflections for Excel/Google Sheets compatibility.
 */
export function buildReflectionsCsv(entries: ReflectionEntry[]): string {
  const headers = [
    'ID Refleksi',
    'Waktu Kirim (ISO)',
    'Tanggal & Jam (WIB)',
    'Nama Lengkap Siswa',
    'Kelas',
    'Ekspresi Perasaan',
    'Pesan Refleksi',
    'Status Sinkronisasi Sheets',
    'Sumber Aplikasi',
  ];

  const escapeCsvCell = (val: string): string => {
    const safe = String(val ?? '').replace(/"/g, '""');
    return `"${safe}"`;
  };

  const rows = entries.map((item) => {
    const formattedDate = (() => {
      try {
        return new Date(item.createdAt).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      } catch {
        return item.createdAt;
      }
    })();
    const feelingLabel = item.feeling === 'seru' ? 'Seru Banget!' : 'Bosan!';
    return [
      item.id,
      item.createdAt,
      formattedDate,
      item.studentName,
      item.studentClass,
      feelingLabel,
      item.message || '-',
      item.syncStatus,
      item.source,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}
