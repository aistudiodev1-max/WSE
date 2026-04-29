# WEC v2 Frontend API Guidelines

Frontend implementation guide for `/api/v2` institution group and study plan workflows.

This guide is practical and flow-oriented. For complete endpoint inventory, see `docs/API_REFERENCE.md`.

---

## 1) Scope and Base Path

- **Base path:** `/api/v2`
- **Current v2 domain:** institution group governance, institution study plan governance, member progress tracking, and head replacement
- **Backward compatibility:** `/api/v1` remains unchanged

---

## 2) Authentication and Headers

- Send Bearer token on all protected calls:
  - `Authorization: Bearer <token>`
- Use JSON content type for write operations:
  - `Content-Type: application/json`

Typical fetch wrapper:

```ts
const api = (path: string, init: RequestInit = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
```

---

## 3) Role Expectations in v2

- **Executive**
  - Full access to v2 group/plan/progress monitoring across all institutions
  - Has separate global plan action APIs under `/api/v2/plans/...`
  - Can assign global plans to specific institutions (visibility targeting)
  - Cannot initiate head transfer
- **Institution Head**
  - Full access for own institution only
  - Can CRUD study plans and assign plans to groups
  - Can create/update/delete groups and manage members/leaders
  - Is the only role allowed to initiate head transfer
- **Institution Leader**
  - Can update group details and add/remove members
  - Can monitor group plan progress
  - Cannot create/delete groups
  - Cannot CRUD study plans or assign plans
- **Institution Observer**
  - Read-only where permitted; no write operations
  - No eStudy access

---

## 4) Data Rules Frontend Must Respect

- **Study plan here is not subscription plan**
  - This is learning/study content planning (`plans` table, institution-scoped records)
- **Plan ownership**
  - v2 plan CRUD only for plans with `institution_id` = current institution
- **Plan status values**
  - Use only: `active`, `inactive`
- **Group-to-plan cardinality**
  - A group can have many plans, or zero plans
- **Plan assignment before active usage**
  - A group may exist with zero plans, but session-study APIs are only usable for plans assigned to that group
- **Plan assignment requires content**
  - A plan must have at least one session before it can be assigned to a group
- **Global visibility vs targeted visibility**
  - Global plans (`institution_id = null`) are available to all institutions by default
  - Once Executive assigns institution targets, the plan becomes visible only to those institutions
- **Membership boundaries**
  - Group members must belong to the same institution as the group

---

## 5) Recommended UI Modules

- **Group Management**
  - List, create, update, delete groups
  - Add/remove members
  - Assign/remove leaders
- **Study Plan Management**
  - List, create, update, delete institution plans
  - Assign/unassign plans to group
- **Progress**
  - Member updates own plan/session progress
  - Leader/Head/Executive monitors member progress by group+plan
- **Head Replacement**
  - Replace head with another institution user
  - Optional target group for demoted head, else default new group

---

## 6) Endpoint Groups (Quick Map)

## Group Management

- `GET /institutions/{institution}/groups`
- `POST /institutions/{institution}/groups`
- `GET /institutions/{institution}/groups/{group}`
- `PUT /institutions/{institution}/groups/{group}`
- `DELETE /institutions/{institution}/groups/{group}`

## Members and Leaders

- `POST /institutions/{institution}/groups/{group}/members`
- `DELETE /institutions/{institution}/groups/{group}/members/{user}`
- `POST /institutions/{institution}/groups/{group}/leaders/{user}`
- `DELETE /institutions/{institution}/groups/{group}/leaders/{user}`
- `PUT /institutions/{institution}/groups/{group}/leaders/{fromUser}/replace/{toUser}`

## Study Plan CRUD (Institution Scoped)

- `GET /plans` (Executive-only global list, optional `institution_id` query)
- `GET /institutions/{institution}/plans`
- `POST /institutions/{institution}/plans`
- `PUT /institutions/{institution}/plans/{planId}`
- `DELETE /institutions/{institution}/plans/{planId}`

## Study Session CRUD (Before Assignment)

- `GET /plans/{planId}/sessions` (Executive-only global list)
- `GET /plans/{planId}/sessions/{sessionId}` (Executive-only global detail)
- `GET /institutions/{institution}/plans/{planId}/sessions` (Executive/Head scoped list)
- `GET /institutions/{institution}/plans/{planId}/sessions/{sessionId}` (Executive/Head scoped detail)
- `POST /institutions/{institution}/plans/{planId}/sessions`
- `PUT /institutions/{institution}/plans/{planId}/sessions/{sessionId}`
- `DELETE /institutions/{institution}/plans/{planId}/sessions/{sessionId}`
- `POST /institutions/{institution}/plans/{planId}/sessions/{sessionId}/supporting-verses`
- `PUT /institutions/{institution}/plans/{planId}/sessions/{sessionId}/supporting-verses/{verseId}`
- `DELETE /institutions/{institution}/plans/{planId}/sessions/{sessionId}/supporting-verses/{verseId}`

## Executive Global Plan Actions

- `POST /plans/{planId}/sessions`
- `PUT /plans/{planId}/sessions/{sessionId}`
- `DELETE /plans/{planId}/sessions/{sessionId}`
- `POST /plans/{planId}/sessions/{sessionId}/supporting-verses`
- `PUT /plans/{planId}/sessions/{sessionId}/supporting-verses/{verseId}`
- `DELETE /plans/{planId}/sessions/{sessionId}/supporting-verses/{verseId}`
- `POST /plans/{planId}/institutions/assign`
- `GET /plans/{planId}/institutions`
- `DELETE /plans/{planId}/institutions/{institutionId}`

## Group Plan Assignment

- `GET /institutions/{institution}/groups/{group}/plans`
- `POST /institutions/{institution}/groups/{group}/plans/assign`
- `DELETE /institutions/{institution}/groups/{group}/plans/{planId}`

## Session Experience (Core User Flow)

- `GET /institutions/{institution}/groups/{group}/plans/{planId}/sessions`
- `GET /institutions/{institution}/groups/{group}/plans/{planId}/sessions/{sessionId}`

## Progress

- `POST /institutions/{institution}/groups/{group}/plans/{planId}/progress`
- `POST /institutions/{institution}/groups/{group}/plans/{planId}/sessions/{sessionId}/progress`
- `GET /institutions/{institution}/groups/{group}/plans/{planId}/progress`

## Head Replacement

- `PUT /institutions/{institution}/head/replace/{user}`

---

## 7) Payload Guidelines

## Create Study Plan

```json
{
  "title": "Leadership Foundations",
  "status": "active",
  "duration_weeks": 8
}
```

## Assign Plans to Group

```json
{
  "plan_ids": ["inst_plan_leadership_foundations_xxxxxxxx"]
}
```

## Create Session (Institution Scoped)

```json
{
  "title": "Week 1 - Called to Lead",
  "order_index": 1,
  "primary_verse": "1 Timothy 4:12",
  "teaching_text": "Teaching content here",
  "reflection_prompt": "How will you apply this this week?"
}
```

Notes:
- `session_id` is generated by backend.
- `order_index` conflicts are auto-resequenced.

## Assign Global Plan to Institutions (Executive)

```json
{
  "institution_ids": [1, 5, 9]
}
```

## Update Member Plan Progress

```json
{
  "status": "in_progress",
  "progress_percent": 50
}
```

## Update Session Progress

```json
{
  "is_completed": true
}
```

## Open Session (Auto-start tracking)

```http
GET /api/v2/institutions/{institution}/groups/{group}/plans/{planId}/sessions/{sessionId}
```

Behavior:
- Returns full session content (primary verse, supporting verses, teaching text, reflection prompt).
- Automatically creates/updates progress start state for the current user if this is first open.

## Replace Institution Head

```json
{
  "target_group_id": 12,
  "new_group_name": "Transition Group",
  "new_group_description": "Leadership transition"
}
```

Notes:
- `target_group_id` is optional.
- If omitted, backend creates a new group and assigns old head there as leader.
- Only the current institution head can call the head replacement endpoint.

---

## 8) Frontend Error Handling

Treat these status codes consistently:

- **401** unauthenticated (token missing/expired)
- **403** authenticated but not authorized for role/scope
- **404** resource not found or not visible
- **422** validation/business rule error (show backend message)

Recommended UX:
- Show inline validation for 422
- Show role-based permission message for 403
- Refresh token or force relogin for repeated 401

---

## 9) Suggested Frontend Flow

1. Load institution context and role.
2. Load groups.
3. Load institution study plans.
4. For selected group:
   - load assigned plans
   - assign/unassign as needed (Head/Executive)
5. For selected plan in group:
   - member opens sessions (auto-start tracking)
   - member updates session completion
   - leader/head monitors member progress grid

---

## 10) References

- Canonical API details: `docs/API_REFERENCE.md`
- Postman examples: `postman/WEC_API_Collection.postman_collection.json`
