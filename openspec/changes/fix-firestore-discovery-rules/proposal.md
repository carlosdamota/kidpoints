# Proposal: Fix Firestore Discovery Rules

## Intent

Resolve the `Missing or insufficient permissions` error when authenticated users query the `families` collection to discover which family they belong to. The current Firestore rule for `list` operations incorrectly uses `resource.data` which is not available during query evaluation.

## Scope

### In Scope
- Correct the Firestore `list` rule for `/families/{familyId}` to properly validate `array-contains` queries
- Maintain security isolation so users can only query families where they are members
- Keep admin override functionality for `get` operations
- Ensure validation rules remain consistent with existing data schema

### Out of Scope
- Changing the frontend query structure in `FamilyContext.tsx`
- Modifying other collections or security rules
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
- firestore-security: Modify list validation for family discovery queries

## Approach

The frontend query `where('allowedEmails', 'array-contains', user.email)` requires a Firestore rule that statically validates this filter. The current rule uses `resource.data.allowedEmails` which is only available when reading a specific document, not during query planning.

Solution: Update the `list` rule to validate that the query includes the appropriate filter for the authenticated user's email. Since Firestore rules cannot inspect query filters directly when using `array-contains`, we need to restructure the rule to allow the query while maintaining security.

Proposed implementation:
1. Remove `resource.data` reference from the `list` rule
2. Allow `list` for authenticated users with a simpler check that validates query structure
3. Maintain stricter `get` rule for individual document access (including admin override)
4. Ensure `create` and `update` rules remain unaffected

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `firestore.rules` (line 83) | Modified | Update `allow list:` rule for `/families/{familyId}` |
| `src/context/FamilyContext.tsx` | Verified | Query structure remains unchanged |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-permissive rule exposes family data | Medium | Keep `get` rule strict; test with Firestore emulator |
| Breaking existing functionality | Low | Verify `create` and `update` rules remain compatible |
| Admin access incorrectly limited | Low | Maintain admin override in `get` rule only |

## Rollback Plan

1. Revert changes to `firestore.rules`
2. Redeploy previous rules version via Firebase CLI
3. No frontend changes required for rollback

## Dependencies

- Firebase CLI for rules deployment
- Firestore emulator for local testing

## Success Criteria

- [ ] Users can successfully query families they belong to via `array-contains` filter
- [ ] No `Missing or insufficient permissions` errors during family discovery
- [ ] Admin users retain access via email override
- [ ] Data isolation maintained between families
- [ ] All existing create/update operations continue to work