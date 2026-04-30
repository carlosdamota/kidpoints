# Proposal: Fix Migration Errors

## 1. Intent
The goal is to fix 3 critical errors and 1 warning discovered after the migration to the subcollection architecture:
1. Syntax error in `AdminView.tsx` preventing the project from building.
2. Missing document ID in `HistoryEntry` leading to failing delete operations.
3. Obsolete validation rules in `firestore.rules` preventing family doc updates.
4. TypeScript warnings for optional array usage in `TiendaView` and `MisionesView`.

## 2. Proposed Approach
- **AdminView**: Remove lines 431-433 manually. Ensure no trailing syntax errors remain.
- **HistoryEntry**: Modify `types.ts` to add `id: string` to `HistoryEntry`. In `FamilyContext.tsx`, update the mapping inside `loadHistory` to inject `d.id` into the returned object.
- **Rules**: Modify `firestore.rules` by removing the `children` key from the `hasRequiredFields` and `hasOnlyAllowedFields` checks, as well as removing the array size check for `data.children` inside `isValidFamily`.
- **Views**: In `TiendaView.tsx` and `MisionesView.tsx`, fall back to empty arrays `activeChild.tasks ?? []` and `activeChild.rewards ?? []` to satisfy TypeScript strict mode.

## 3. Scope
- `src/components/views/AdminView.tsx`
- `src/context/FamilyContext.tsx`
- `src/types.ts`
- `firestore.rules`
- `src/components/views/TiendaView.tsx`
- `src/components/views/MisionesView.tsx`

## 4. Risks
- Modifying `firestore.rules` incorrectly could lock users out of their families or allow unauthorized data shapes. We must be careful to only remove the `children` constraint without relaxing other critical checks.
