# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: All unmatched paths in Firestore are strictly denied for both read and write (`allow read, write: if false;`).
2. **Reflection Creation Invariant (`/reflections/{reflectionId}`)**:
   - Students do not have accounts (`tanpa akun siswa`), so `create` is permitted only when the incoming document strictly matches the `Reflection` blueprint:
     - `isValidId(reflectionId)` holds (`<= 128` chars, `^[a-zA-Z0-9_\-]+$`) and `incoming().id == reflectionId`.
     - `incoming().keys().hasAll(...)` and `incoming().keys().hasOnly(...)` prevent any shadow/ghost fields.
     - `studentName` is a non-empty string (`2..100` chars).
     - `studentClass` is a non-empty string (`1..32` chars).
     - `feeling` is strictly `'seru'` or `'bosan'`.
     - `message` is a string (`0..1000` chars).
     - `source` is strictly `'bangun-datar-adventure-v2'`.
     - `syncStatus` is strictly in `['synced', 'pending', 'failed']`.
     - `serverCreatedAt == request.time` (enforces server-side temporal integrity).
3. **Reflection Privacy & Read Invariant**:
   - Unauthenticated visitors and non-admin users CANNOT `get` or `list` `/reflections/{reflectionId}`.
   - Only verified admins (`isBootstrappedAdmin()` or allowlisted `/admins/{uid}`) can read reflections where `resource.data.source == 'bangun-datar-adventure-v2'`.
4. **Reflection Update Invariant**:
   - Core student reflection fields (`id`, `studentName`, `studentClass`, `feeling`, `message`, `createdAt`, `createdAtTimestamp`, `serverCreatedAt`, `source`) are strictly immutable after creation.
   - Only a verified admin can update synchronization status fields (`syncStatus`, `sheetSyncedAt`, `lastSyncError`) using `affectedKeys().hasOnly(...)` wrapped inside `isValidReflection(incoming())`.
5. **Admin Allowlist Invariant (`/admins/{adminUid}`)**:
   - No client can create, update, or delete documents in `/admins/{adminUid}` (`allow create, update, delete: if false;`), preventing privilege escalation and self-assigned admin roles.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Ghost Field Injection on Create)**: Includes `"isAdmin": true` in `/reflections/ref_1`. Rejected by `hasOnly()`.
2. **Payload 2 (ID Poisoning / Oversized ID)**: 500-character junk string as `{reflectionId}`. Rejected by `isValidId()`.
3. **Payload 3 (Empty Student Name)**: `studentName: " "` or `""`. Rejected by `studentName.trim().size() >= 2`.
4. **Payload 4 (Oversized Message Denial-of-Wallet)**: `message` with 10,000 characters. Rejected by `message.size() <= 1000`.
5. **Payload 5 (Invalid Feeling Enum)**: `feeling: "marah"`. Rejected by `feeling in ['seru', 'bosan']`.
6. **Payload 6 (Forged Server Timestamp)**: `serverCreatedAt: Timestamp.fromMillis(1000000)`. Rejected by `incoming().serverCreatedAt == request.time`.
7. **Payload 7 (Public Read Scraping)**: Unauthenticated `get` or `list` on `/reflections`. Rejected by admin authentication gate.
8. **Payload 8 (Unverified Admin Email Spoof)**: Authenticated user with `email == 'luqnirahman@gmail.com'` but `email_verified == false`. Rejected by `request.auth.token.email_verified == true`.
9. **Payload 9 (Non-Admin Authenticated Read)**: Signed-in user not in `/admins` and not bootstrapped admin trying to read `/reflections`. Rejected by `isAdmin()`.
10. **Payload 10 (Immutable Field Tampering on Update)**: Admin attempting to modify `studentName` or `message` on an existing reflection. Rejected by immutability & `affectedKeys().hasOnly()`.
11. **Payload 11 (Value Poisoning on Update)**: Admin updating `syncStatus` to `"hacked_status"`. Rejected by `isValidReflection(incoming())`.
12. **Payload 12 (Self-Assigned Admin Privilege Escalation)**: Signed-in user attempting `setDoc(doc(db, 'admins', uid), { email: 'x@y.com', role: 'admin' })`. Rejected by `allow create: if false;`.
