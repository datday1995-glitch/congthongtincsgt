# Security Specification & Hardened Rules Audit

## 1. Data Invariants
1. **Public vs Draft Isolation**: Unauthenticated citizens can only read (`get` / `list`) `articles` where `status == 'published'` and `categories` where `isVisible == true`. Draft and hidden articles must never be queryable by the public.
2. **Passcode Confidentiality**: Passcodes are never stored in plain text. `passcodes` documents only store `passcodeHash` (salted scrypt hash) and are readable/writable exclusively by verified Super Admins (`datday1995@gmail.com` or `admins` with `role == 'super_admin'` and `status == 'active'`).
3. **Strict Identity Verification**: All admin/editor checks enforce `request.auth.token.email_verified == true`. No role escalation is possible via client payloads.
4. **Immutable Audit Trail**: `activityLogs` records cannot be updated or deleted once created, and `createdAt`/`updatedAt` fields must equal `request.time`.
5. **Relational Integrity**: Every `article` created or updated must reference an existing `categoryId` in `/categories/{categoryId}`.
6. **Path ID & Payload Size Hardening**: All single-document operations validate `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars), and all strings/arrays enforce explicit `.size()` bounds.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Draft Read**: Anonymous client requests `get` on `/articles/draft-1` where `status == 'draft'`.
2. **Unauthenticated List Scraping**: Anonymous client queries `/articles` without `where('status', '==', 'published')`.
3. **Passcode Hash Exfiltration**: Non-super-admin or anonymous user attempts `list` or `get` on `/passcodes`.
4. **Email Spoofing Attack**: User with `email == 'datday1995@gmail.com'` and `email_verified == false` attempts to write to `/siteSettings/main`.
5. **Shadow Ghost Field Injection**: Editor attempts to create `/articles/art-1` with an extra undeclared field `isFeatured: true`.
6. **Self-Privilege Escalation**: Editor attempts to create `/admins/{ownUid}` with `role: 'super_admin'`.
7. **Author Spoofing**: Editor attempts to create `/articles/art-2` with `authorId` set to another user's UID.
8. **Timestamp Forgery**: Editor attempts to create `/articles/art-3` with a backdated client timestamp instead of `request.time`.
9. **ID Poisoning**: Attacker attempts `create` on `/articles/../../etc/passwd` or a 500-char ID.
10. **Denial of Wallet Payload**: Attacker attempts to create an article with a 600KB `contentHtml` or 50 attachments.
11. **Orphaned Category Reference**: Editor attempts to create `/articles/art-4` referencing a non-existent `categoryId: 'missing-cat'`.
12. **Audit Log Tampering**: Editor or Super Admin attempts to `update` or `delete` `/activityLogs/log-1`.
