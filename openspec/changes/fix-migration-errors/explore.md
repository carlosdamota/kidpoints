# SDD Exploration: Fix Migration Errors

## 1. Syntax Error in AdminView.tsx
**Problem**: Lines 431-433 contain orphaned code (`'destructive'\n);\n};`) left over from a bad multi-replace.
**Solution**: Remove these lines.

## 2. HistoryEntry ID Missing
**Problem**: `loadHistory` in `FamilyContext.tsx` maps history docs using `d.data() as HistoryEntry`. Since `d.id` is not included in `d.data()`, `entry.id` is undefined. `deleteHistoryEntry` fails.
**Solution**: 
- Update `types.ts`: add `id: string` to `HistoryEntry`.
- Update `FamilyContext.tsx`: `snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry))`.

## 3. Firestore Rules Validation
**Problem**: `firestore.rules` enforces that `families` documents must have a `children` field (`hasRequiredFields`, `hasOnlyAllowedFields`). The migration deletes this field.
**Solution**: Remove `children` from the arrays in `hasRequiredFields` and `hasOnlyAllowedFields`, and remove the size validation for `data.children`.

## 4. Optional Array Warnings
**Problem**: `TiendaView.tsx` and `MisionesView.tsx` use `activeChild.tasks` and `activeChild.rewards` which are optional.
**Solution**: Provide fallback empty arrays `?? []` when iterating to satisfy TypeScript.
