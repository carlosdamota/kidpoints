# Tasks: Fix Migration Errors

## Task 1: Fix AdminView syntax error
- File: `src/components/views/AdminView.tsx`
- Action: Delete the orphaned lines around 431-433 containing `'destructive'\n);\n};`.
- Action: Ensure there are no dangling brackets or syntax errors in `AdminView.tsx` at the end of the file.

## Task 2: Fix HistoryEntry ID
- File: `src/types.ts`
- Action: Add `id?: string;` to the `HistoryEntry` interface.
- File: `src/context/FamilyContext.tsx`
- Action: Modify `loadHistory` to return `{ id: d.id, ...(d.data() as HistoryEntry) }` inside `setActiveChildHistory(snap.docs.map(...))`.

## Task 3: Fix Firestore Rules
- File: `firestore.rules`
- Action: Inside `hasRequiredFields`, remove `'children'` from the array.
- Action: Inside `hasOnlyAllowedFields`, remove `'children'` from the array.
- Action: Inside `isValidFamily`, remove `data.children is list &&` and `data.children.size() >= 0 && data.children.size() <= 10;`.

## Task 4: Fix TypeScript Array Warnings
- File: `src/components/views/TiendaView.tsx`
- Action: Change `activeChild.rewards.map` to `(activeChild.rewards ?? []).map`.
- File: `src/components/views/MisionesView.tsx`
- Action: Change `activeChild.tasks.map` to `(activeChild.tasks ?? []).map`.
