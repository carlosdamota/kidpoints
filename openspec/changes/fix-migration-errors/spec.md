# Specification: Fix Migration Errors

## Requirements

1. **REQ-01: AdminView Syntax Fix**
   - The project MUST compile successfully (`tsc --noEmit`).
   - `src/components/views/AdminView.tsx` MUST NOT contain the orphaned `'destructive'` text.

2. **REQ-02: HistoryEntry ID Population**
   - `HistoryEntry` type MUST include an `id` field of type `string`.
   - `loadHistory` MUST map the Firestore document ID to the `id` field of the returned entries.
   - Deleting a history entry MUST successfully use the `entry.id`.

3. **REQ-03: Firestore Rules Compatibility**
   - The `families` collection MUST allow updates for migrated documents (which do not have a `children` field).
   - Validations for required fields MUST NOT require `children`.
   - The rules MUST NOT break access for existing valid operations.

4. **REQ-04: View Components Type Safety**
   - `TiendaView` and `MisionesView` MUST NOT produce TypeScript warnings regarding iteration over possibly undefined `activeChild.tasks` or `activeChild.rewards`.

## Scenarios

### Scenario 1: Compiling the project
**GIVEN** the codebase with all fixes applied
**WHEN** the user runs `pnpm lint` (or `tsc --noEmit`)
**THEN** the command should exit with 0 without any TS1128 errors.

### Scenario 2: Deleting a history entry
**GIVEN** a child with at least one history entry
**WHEN** the parent deletes that history entry
**THEN** the history entry MUST have a valid `id` string and the Firestore deletion MUST succeed.

### Scenario 3: Updating Family Config
**GIVEN** an authenticated parent
**WHEN** the parent updates the PIN or Task Mode
**THEN** Firestore MUST accept the update and not reject it due to a missing `children` field.
