# Proposal: Fix Firestore Case and Operator Mismatch

## Intent

Resolve the lingering `"Missing or insufficient permissions"` error in family discovery queries by fixing case-sensitivity mismatches between the Firebase SDK and Firestore security rules. The previous fix (fix-firestore-discovery-rules) correctly restructured the query validation but introduced two critical issues: 1) operator name case mismatch (`'array-contains'` vs `'ARRAY_CONTAINS'`), and 2) case-sensitive email comparison that fails with email variations.

## Scope

### In Scope
- Fix operator name case mismatch in the `list` rule (line 86 of firestore.rules)
- Add email normalization (`.lower()`) to the email comparison in the `list` rule
- Flexibilize filter validation to accommodate multiple filters if needed
- Improve the rule's robustness against frontend query structure changes

### Out of Scope
- Changing other security rules (get, create, update, delete remain unchanged)
- Modifying frontend query structure
- Adding new capabilities or features

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.
> Research `openspec/specs/` before filling this in.

### New Capabilities
<!-- Capabilities being introduced. Each becomes a new `openspec/specs/<name>/spec.md`.
     Use kebab-case names (e.g., user-auth, data-export, api-rate-limiting).
     Leave empty if no new capabilities. -->
None

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec.
     Use existing spec names from openspec/specs/. Leave empty if none. -->
- firestore-security: Fix case sensitivity and operator naming in family discovery queries

## Approach

The issue stems from two discrepancies:
1. **Operator case mismatch**: Firebase SDK sends kebab-case `'array-contains'` while the rule expects uppercase `'ARRAY_CONTAINS'`
2. **Email case sensitivity**: The rule compares `request.auth.token.email` directly with query value, but emails might have different cases in the database or token

Solution:
1. Change the operator check from `== 'ARRAY_CONTAINS'` to `in ['array-contains', 'ARRAY_CONTAINS']` to handle both formats
2. Normalize email comparison using `.lower()` on both sides
3. Relax filter count validation to allow additional filters (e.g., limit, orderBy) while still requiring the security filter

Modified rule will:
- ✅ Accept both operator formats for compatibility
- ✅ Handle email case variations safely
- ✅ Allow additional query modifiers without breaking security
- ✅ Maintain all existing security guarantees

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `firestore.rules` (line 83-87) | Modified | Update `list` rule for `/families/{familyId}` - fix operator case, add email normalization, flexibilize filter validation |
| `src/context/FamilyContext.tsx` | Verified | Query structure remains compatible |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-permissive security due to relaxed filter validation | Low | Still require the specific allowedEmails filter with proper email validation |
| Breaking change for other use of the rule | None | Only affects `list` operation for families collection |
| Compatibility with existing data | Low | `.lower()` ensures case-insensitive comparison works with all email formats |

## Rollback Plan

1. Revert changes to `firestore.rules`
2. Redeploy previous rules version via Firebase CLI
3. No frontend changes required for rollback

## Dependencies

- Firebase CLI for rules deployment
- The previous fix-firestore-discovery-rules change as baseline

## Success Criteria

- [ ] Users can successfully query families regardless of email case variations
- [ ] Both `'array-contains'` and `'ARRAY_CONTAINS'` operator formats are accepted
- [ ] No `Missing or insufficient permissions` errors during family discovery
- [ ] Security isolation maintained between families
- [ ] Queries with additional filters (orderBy, limit) continue to work