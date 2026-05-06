# Field Invariants
User: userId, email
Note: userId, groupId, planId, sessionId, noteType, content, verseId, visibility, createdAt, updatedAt
- visibility must be "private" or "shared_group"
- noteType must be "session", "verse", or "plan"

# Dirty Dozen Payloads
1. Note with missing required field
2. Note with oversized ID
3. Note with modified userId
4. Note with invalid type
5. Note with modified createdAt
6. Read group note if not owner (and not shared) -> blocked
7. List group notes bypassing client filter -> blocked
8. Create note for another user -> blocked
9. Note with malicious visibility
