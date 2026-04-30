# Design: Fix Migration Errors

## Technical Approach

The approach focuses on minimal, surgical fixes to address the fallout of the subcollection migration:
1. **Clean Code**: Remove syntactic errors leftover from automated code refactoring.
2. **Data Consistency**: Ensure Firestore document IDs are correctly mapped to runtime objects during read operations.
3. **Security Rule Alignment**: Sync the Firebase security rules with the new document shapes to prevent rejected writes.
4. **Type Safety**: Use nullish coalescing to safely traverse optional arrays in views.

## Architecture Decisions

### Decision: History ID Injection

**Choice**: Map `d.id` to the `id` field in the `HistoryEntry` type when pulling from Firestore.
**Alternatives considered**: Change `deleteHistoryEntry` to search for the entry by timestamp and value instead of ID.
**Rationale**: Searching by timestamp is fragile and non-deterministic if multiple entries share the exact same timestamp. Relying on the unique Firestore document ID is the standard and correct way to target specific documents for deletion.

### Decision: Relaxing Family Rules

**Choice**: Remove `children` from the required/allowed fields for `families` documents in `firestore.rules`.
**Alternatives considered**: Write a migration that inserts an empty `children: []` array just to satisfy the rules.
**Rationale**: Storing empty arrays contradicts the purpose of migrating to subcollections. The rules must reflect the actual intended data model, which no longer includes a monolithic `children` array on the parent document.

## Data Flow

```text
Firestore (families/{id}/children/{id}/history/{entryId}) 
    │ 
    ▼ 
FamilyContext (loadHistory)
    │ maps { ...d.data(), id: d.id }
    ▼ 
State (activeChildHistory)
    │
    ▼
AdminView (deleteHistoryEntry)
    │ passes entry.id
    ▼
Firestore (batch.delete)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/views/AdminView.tsx` | Modify | Remove orphaned `'destructive'` text at lines 431-433. |
| `src/types.ts` | Modify | Add `id?: string` to `HistoryEntry` interface. |
| `src/context/FamilyContext.tsx` | Modify | Update `snap.docs.map` in `loadHistory` to inject the document `id`. |
| `firestore.rules` | Modify | Remove `children` from `hasRequiredFields` and `hasOnlyAllowedFields` arrays. Remove `data.children` size check from `isValidFamily`. |
| `src/components/views/TiendaView.tsx` | Modify | Add `?? []` to `activeChild.rewards` mapping. |
| `src/components/views/MisionesView.tsx` | Modify | Add `?? []` to `activeChild.tasks` mapping. |

## Interfaces / Contracts

```typescript
export interface HistoryEntry {
  id?: string; // Added to map Firestore document ID
  date: string;
  dateStr?: string;
  points: number;
  reason: string;
  type: 'earn' | 'spend' | 'admin';
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Build Compilation | Run `tsc --noEmit` to verify TS1128 is resolved. |
| Integration | Rule Validation | Run local app, update Family PIN, verify Firestore accepts it. |
| Integration | History Deletion | Add history entry, delete it via Admin panel, verify deletion. |

## Migration / Rollout

No data migration required. This is a fix for an existing migration.

## Open Questions

- None.
