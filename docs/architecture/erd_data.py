# Single source of truth for the Form Builder ERD.
# Generates system_erd.md (Mermaid) and erd.html (review page).

SECTIONS = [
    ("01", "Platform core: identity & access", "Shared kernel with Cobley (same table and column names) plus organization_id for tenancy. Users, statuses, organisations, roles with JSON permissions, menus. Builder URLs are path-based: /{org.slug}/forms."),
    ("01B", "Platform core: locations", "Cobley location tree (parent_id + closure table, typed by location_types) scoped per organisation. user_locations carries several custom roles per location plus JSON grants and denials. Reference lists: countries, wards."),
    ("01C", "Platform core: approvals", "Cobley approval workflow: request types with ordered steps (roles, permissions or users, OR/AND), requests per location, approval turns and delegations."),
    ("02", "Forms & Versions", "The form record holds settings and the autosaved draft. Publishing freezes the draft into an immutable version. A form can belong to a location."),
    ("03", "Distribution & Respondents", "Private-form invitations, global respondent identities, and email OTP verification."),
    ("04", "Attempts & Integrity", "A respondent session: server-owned timers, single-tab heartbeat, fullscreen and copy/paste violation log."),
    ("05", "Responses & Answers", "Submitted responses, their revisions (edit-after-submit), and one row per answer for SQL summaries."),
    ("06", "Notifications, Integrations & Exports", "Owner alerts, signed webhooks with retry, and queued Excel/CSV exports."),
]

# entity: (section, name, [ (type, field, keys, comment) ], notes)
E = []
def ent(sec, name, fields, notes=""):
    E.append((sec, name, fields, notes))

STD = [("bigint", "created_by_id", "FK", "users.id"), ("bigint", "updated_by_id", "FK", "users.id, nullable"), ("timestamp", "deleted_at", "", "soft delete"), ("char", "uuid", "UK", "uuid()")]

# ---------- 01 Platform core: identity & access (shared with Cobley)
ent("01", "STATUSES", [
    ("bigint", "id", "PK", ""),
    ("string", "name", "UK", "Active, Pending, Inactive, Suspended..."),
    ("string", "color", "", "default #6b7280"),
    ("text", "description", "", ""),
], "Cobley core. Master-data tables (users, organisations, locations, roles, request types) use status_id. Workflow states (forms, attempts, responses, requests) stay as enums.")

ent("01", "USERS", [
    ("bigint", "id", "PK", ""),
    ("string", "name", "", ""),
    ("string", "username", "UK", "sign-in identifier"),
    ("string", "email", "UK", "sign-in identifier, nullable"),
    ("string", "phone", "UK", "E.164, sign-in identifier, nullable"),
    ("string", "password", "", "hashed"),
    ("timestamp", "password_set_at", "", "Cobley core"),
    ("bigint", "status_id", "FK", "statuses.id"),
    ("datetime", "last_logged_in_at", "", "Cobley core"),
    ("text", "two_factor_secret", "", "Fomu addition: encrypted TOTP secret"),
    ("text", "two_factor_recovery_codes", "", "Fomu addition, encrypted"),
    ("timestamp", "two_factor_confirmed_at", "", "Fomu addition; NULL = 2FA off"),
    ("enum", "theme_preference", "", "light | dark | system"),
] + STD, "Cobley users + Fomu 2FA columns. Global: one user can belong to several organisations. Related Cobley auth tables kept as-is: otps, user_invitations, force_password_resets, personal_access_tokens, user_device_tokens.")

ent("01", "USER_TRUSTED_DEVICES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "user_id", "FK", ""),
    ("char", "token_hash", "", "cookie token, sha256"),
    ("string", "device_name", "", "parsed user agent"),
    ("string", "ip", "", ""),
    ("timestamp", "last_used_at", "", ""),
    ("timestamp", "expires_at", "", "30 days"),
], "Fomu addition. Skips the 2FA step on a remembered device.")

ent("01", "ORGANIZATIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "public_id", "UK", "exposed in API"),
    ("string", "name", "", ""),
    ("string", "slug", "UK", "path segment /{org}"),
    ("bigint", "root_location_id", "FK", "locations.id of type organization"),
    ("json", "branding", "", "logo, accent (preset key or #rrggbb), accent_tokens (derived, P42), default theme"),
    ("string", "timezone", "", "default Africa/Dar_es_Salaam"),
    ("json", "summary_view_defaults", "", "per question type chart view"),
    ("boolean", "require_2fa", "", ""),
    ("bigint", "status_id", "FK", "statuses.id"),
] + STD, "Fomu tenant. Every tenant-owned table carries organization_id behind a global scope. The org is also the root node of its location tree.")

ent("01", "ORGANIZATION_USERS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", ""),
    ("bigint", "user_id", "FK", ""),
    ("bigint", "role_id", "FK", "MAIN role (role_type = system): owner | admin | editor | viewer"),
    ("boolean", "is_owner", "", "exactly one per org; owner role locked"),
    ("timestamp", "joined_at", "", ""),
] + STD, "Membership + the user's one main role in this organisation. Location-specific custom roles live on user_locations. UNIQUE(organization_id, user_id).")

ent("01", "ROLES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "NULL = system role shared by all orgs"),
    ("string", "name", "", "UNIQUE(organization_id, name)"),
    ("text", "description", "", ""),
    ("string", "role_type", "", "system (main roles) | custom (location roles); Cobley column"),
    ("bigint", "status_id", "FK", "statuses.id"),
    ("json", "permissions", "", "array of permission names; Cobley core"),
] + STD, "Cobley roles + organization_id. System roles are assigned on organization_users; custom roles only on user_locations (never as a main role). Multi-valued index on permissions.")

ent("01", "PERMISSIONS", [
    ("bigint", "id", "PK", ""),
    ("string", "name", "UK", "Module.action, e.g. Logs.view, Responses.export"),
    ("string", "title", "", "human name shown in Roles"),
    ("string", "module", "", "grouping in the Roles checklist"),
    ("text", "description", "", ""),
] + STD, "Cobley core catalogue, seeded by the app (Cobley's Module.action naming). Global, not editable by tenants.")

ent("01", "MENUS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "parent_id", "FK", "self, NULL = top level"),
    ("string", "title", "", ""),
    ("string", "url", "", "NULL for parents"),
    ("string", "icon", "", "lucide name"),
    ("json", "permission", "", "Cobley core; children hold exactly one name (D8), parents NULL"),
    ("string", "module_route", "", "Cobley core"),
    ("int", "position", "", "sort order"),
    ("boolean", "is_active", "", "hidden for everyone when 0"),
    ("string", "group_label", "", "Fomu addition: heading inside a panel"),
    ("enum", "display_mode", "", "Fomu addition: dropdown | panel | section"),
    ("enum", "animation", "", "Fomu addition: default | stagger | fade | slide | none"),
] + STD, "Cobley menus + three display columns. Parent visible when ANY child is visible (OR).")

ent("01", "IMPERSONATION_SESSIONS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", ""),
    ("bigint", "admin_user_id", "FK", "users.id, who is looking"),
    ("enum", "mode", "", "person | role (D37)"),
    ("bigint", "viewed_user_id", "FK", "users.id, whose view; NULL for a role preview"),
    ("string", "viewed_main_role", "", "role preview: owner | admin | editor | viewer"),
    ("bigint", "viewed_role_id", "FK", "roles.id, custom role previewed; nullable"),
    ("bigint", "location_id", "FK", "context location, nullable"),
    ("string", "reason", "", "optional"),
    ("string", "ip", "", ""),
    ("timestamp", "started_at", "", ""),
    ("timestamp", "ended_at", "", ""),
], "Fomu addition: audit for 'View as'. Read-only mode; every write is refused while a session is open.")

# ---------- 01B Platform core: locations (shared with Cobley)
ent("01B", "LOCATION_TYPES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "NULL = system type"),
    ("string", "name", "", "organization, company, zone, cluster, branch, shop, warehouse"),
    ("string", "code", "", "UNIQUE(organization_id, code)"),
    ("string", "color", "", "badge colour"),
] + STD, "Cobley core + organization_id so tenants can add their own types.")

ent("01B", "LOCATIONS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("string", "name", "", "UNIQUE(organization_id, name)"),
    ("string", "code", "", "UNIQUE(organization_id, code), e.g. ARU-01"),
    ("bigint", "location_type_id", "FK", ""),
    ("bigint", "parent_id", "FK", "self, NULL only for the org root"),
    ("boolean", "allow_sales", "", "Cobley core (unused by Fomu)"),
    ("bigint", "status_id", "FK", "statuses.id"),
    ("string", "address", "", "Fomu addition"),
    ("bigint", "ward_id", "FK", "wards.id (Tanzanian ward, district, region)"),
    ("bigint", "country_id", "FK", "countries.id"),
    ("string", "phone", "", ""),
    ("string", "email", "", ""),
    ("decimal", "latitude", "", ""),
    ("decimal", "longitude", "", ""),
    ("json", "opening_hours", "", "{mon: ['08:00','18:00'], ...}"),
] + STD, "Cobley location tree + organization_id and contact/geo columns. The manager is not stored here: it is whoever holds a Manager custom role in user_locations.")

ent("01B", "LOCATION_CLOSURES", [
    ("bigint", "ancestor_id", "PK, FK", "locations.id"),
    ("bigint", "descendant_id", "PK, FK", "locations.id"),
    ("int", "depth", "", "0 = self"),
], "Cobley core. Every ancestor/descendant pair, so 'this location and everything under it' is one indexed query. Maintained on create/move.")

ent("01B", "USER_LOCATIONS", [
    ("char", "id", "PK", "uuid()"),
    ("bigint", "user_id", "FK", ""),
    ("bigint", "location_id", "FK", ""),
    ("boolean", "is_primary", "", "one primary per user per organisation"),
    ("json", "roles", "", "several CUSTOM role ids (role_type = custom)"),
    ("json", "granted_permissions", "", "extra permission names at this location"),
    ("json", "denied_permissions", "", "removed here; deny always wins"),
] + STD, "Cobley core minus role_id (main roles stay on organization_users). Applies to the location and its descendants. UNIQUE(user_id, location_id). Multi-valued indexes on the three JSON arrays; changes written to the activity log.")

ent("01B", "COUNTRIES", [
    ("bigint", "id", "PK", ""),
    ("string", "iso", "UK", ""),
    ("string", "name", "UK", ""),
    ("string", "iso3", "", ""),
    ("string", "phonecode", "", ""),
], "Cobley reference list (global).")

ent("01B", "WARDS", [
    ("bigint", "id", "PK", ""),
    ("string", "name", "", ""),
    ("string", "code", "", ""),
    ("string", "district", "", ""),
    ("bigint", "district_id", "", ""),
    ("string", "region", "", ""),
    ("bigint", "region_id", "", ""),
], "Cobley reference list of Tanzanian wards (global).")

# ---------- 01C Platform core: approvals (shared with Cobley)
ent("01C", "REQUEST_TYPES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("string", "name", "", "e.g. Publish form, Export results, Reset respondent"),
    ("string", "code", "", "UNIQUE(organization_id, code)"),
    ("text", "description", "", ""),
    ("boolean", "requires_approval", "", "0 = auto-approve"),
    ("decimal", "threshold_amount", "", "Cobley core; NULL for Fomu types"),
    ("bigint", "status_id", "FK", "statuses.id"),
    ("json", "notify_settings", "", "D43: {channels: [in_app, email, sms, push], events: {waiting, remind, escalate, decision}, remind_hours, remind_max}; in_app always on"),
] + STD, "Cobley core + organization_id. Cannot be activated or saved while a step fails the D40 capacity rule.")

ent("01C", "REQUEST_TYPE_STEPS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "request_type_id", "FK", ""),
    ("int", "step_no", "", "1, 2, 3..."),
    ("json", "approver_role_ids", "", ""),
    ("json", "approver_permission_ids", "", ""),
    ("json", "approver_user_ids", "", ""),
    ("string", "approver_combinator", "", "or | and"),
    ("int", "required_approvals", "", "default 1; D40: eligible approvers must be >= required + 1 when required > 1"),
    ("json", "notify_channels", "", "D43: NULL = workflow default; else the step's own channels"),
    ("boolean", "notify_required", "", "D43: send even to people who opted out of those channels"),
] + STD, "Cobley core. Approvers are resolved at the request's location (and its ancestors) using the effective-permission rule (D21).")

ent("01C", "REQUESTS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("string", "number", "", "UNIQUE(organization_id, number), e.g. REQ-0042"),
    ("bigint", "request_type_id", "FK", ""),
    ("bigint", "requester_id", "FK", "users.id"),
    ("bigint", "location_id", "FK", "where approvers are looked up"),
    ("string", "subject_type", "", "polymorphic, e.g. Form, FormExport"),
    ("bigint", "subject_id", "", ""),
    ("json", "subject_meta", "", "D41: e.g. export format, filters, row count; part of the duplicate-open check"),
    ("decimal", "amount", "", "nullable"),
    ("text", "reason", "", ""),
    ("enum", "status", "", "draft | submitted | in_review | approved | rejected | cancelled"),
    ("int", "current_step", "", ""),
] + STD, "Cobley core + organization_id. Request items (request_items) are kept for Cobley types and unused by Fomu.")

ent("01C", "REQUEST_APPROVALS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "request_id", "FK", ""),
    ("int", "step_no", "", ""),
    ("bigint", "approver_user_id", "FK", "users.id"),
    ("bigint", "acted_by_user_id", "FK", "users.id, may be a delegate"),
    ("bigint", "approval_delegation_id", "FK", "nullable"),
    ("enum", "decision", "", "pending | approved | rejected"),
    ("text", "comment", "", ""),
    ("datetime", "acted_at", "", ""),
    ("boolean", "is_owner_override", "", "D40: Owner completed a short step"),
] + STD, "Cobley core.")

ent("01C", "NOTIFICATION_DELIVERIES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("bigint", "user_id", "FK", "recipient"),
    ("string", "notifiable_type", "", "polymorphic, e.g. Request"),
    ("bigint", "notifiable_id", "", ""),
    ("int", "step_no", "", "nullable"),
    ("enum", "event", "", "waiting | remind | escalate | decision"),
    ("enum", "channel", "", "in_app | email | sms | push"),
    ("enum", "status", "", "queued | held | sent | delivered | failed | skipped"),
    ("string", "skip_reason", "", "opted_out | no_phone | no_app | no_email"),
    ("datetime", "release_at", "", "D44: when a held SMS/push goes out"),
    ("string", "provider_ref", "", "mail id, NJIWA message id, FCM id"),
    ("text", "error", "", ""),
    ("datetime", "sent_at", "", ""),
    ("datetime", "read_at", "", "in_app only"),
] + STD, "D43. One row per recipient x channel x event; Laravel notification channels write it; reminders are a scheduled job that reads open requests.")

ent("01C", "USER_NOTIFICATION_PREFERENCES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("bigint", "user_id", "FK", ""),
    ("string", "category", "", "approvals (more later)"),
    ("enum", "channel", "", "email | sms | push (in_app can't be turned off)"),
    ("boolean", "enabled", "", "default 1"),
] + STD, "D43. UNIQUE(organization_id, user_id, category, channel). Ignored when the step sets notify_required.")

ent("01C", "APPROVAL_DELEGATIONS", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("bigint", "delegator_user_id", "FK", "users.id"),
    ("bigint", "delegate_user_id", "FK", "users.id"),
    ("bigint", "request_type_id", "FK", "NULL = all types"),
    ("date", "valid_from", "", ""),
    ("date", "valid_to", "", ""),
    ("text", "reason", "", ""),
    ("enum", "status", "", "active | expired | revoked"),
] + STD, "Cobley core + organization_id.")

# ---------- 02 Forms & Versions
ent("02", "FORMS", [
    ("ulid", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("bigint", "created_by", "FK", "users.id"),
    ("bigint", "location_id", "FK", "owning location, NULL = organisation-wide"),
    ("boolean", "include_descendants", "", "share with child locations too"),
    ("string", "title", "", ""),
    ("text", "description", "", "nullable"),
    ("string", "slug", "UK", "public URL /f/{slug}"),
    ("enum", "visibility", "", "public | private"),
    ("enum", "status", "", "draft | published | closed | archived"),
    ("bigint", "current_version_id", "FK", "live version, NULL until first publish"),
    ("json", "draft_definition", "", "builder autosave target"),
    ("timestamp", "draft_updated_at", "", "draft ahead of live when > published_at"),
    ("boolean", "accepting_responses", "", "manual open/close toggle"),
    ("timestamp", "opens_at", "", "nullable"),
    ("timestamp", "closes_at", "", "nullable"),
    ("int", "max_responses", "", "nullable"),
    ("boolean", "one_response", "", "one response per verified email"),
    ("boolean", "allow_edit", "", "forced 0 when timer_mode is not off"),
    ("enum", "resume_policy", "", "resume | auto_submit — timed forms, tab closed mid-attempt"),
    ("boolean", "void_consumes_response", "", "always 1 in v1; voided attempt uses the one-response chance"),
    ("enum", "timer_mode", "", "off | whole_form | per_section"),
    ("int", "time_limit_seconds", "", "whole_form only"),
    ("enum", "violation_policy", "", "warn_log | auto_submit | void"),
    ("int", "violation_limit", "", "auto_submit only"),
    ("boolean", "require_fullscreen", "", "blocks devices without Fullscreen API"),
    ("boolean", "single_tab", "", ""),
    ("boolean", "block_copy_paste", "", ""),
    ("json", "theme", "", "accent, header image, font, default mode"),
    ("text", "confirmation_message", "", ""),
    ("json", "embed_domains", "", "allowed iframe parents"),
    ("json", "summary_views", "", "per-question chart view override {question_key: view}; type default when absent"),
    ("int", "response_count", "", "denormalised counter"),
    ("timestamp", "published_at", "", ""),
    ("timestamp", "deleted_at", "", "soft delete"),
], "Settings are real columns (not JSON) because the server enforces them. Per-section time limits live inside the definition.")

ent("02", "FORM_VERSIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("int", "version_no", "", "1, 2, 3..."),
    ("json", "definition", "", "sections, questions, options, logic"),
    ("char", "definition_hash", "", "sha256, skip publish if unchanged"),
    ("int", "question_count", "", ""),
    ("bigint", "published_by", "FK", "users.id"),
    ("timestamp", "published_at", "", ""),
], "Immutable after insert. UNIQUE(form_id, version_no).")

ent("02", "FORM_COLLABORATORS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("bigint", "user_id", "FK", "must be a member of the same org"),
    ("enum", "role", "", "editor | viewer"),
    ("bigint", "added_by", "FK", "users.id"),
    ("timestamp", "created_at", "", ""),
], "Per-form access on top of the org role. UNIQUE(form_id, user_id).")

ent("02", "FORM_TEMPLATES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "NULL = system template"),
    ("string", "name", "", ""),
    ("string", "category", "", "quiz, survey, assessment..."),
    ("text", "description", "", ""),
    ("json", "definition", "", "same shape as form_versions.definition"),
    ("json", "default_settings", "", "timer, integrity, sharing presets"),
    ("boolean", "is_system", "", ""),
    ("bigint", "created_by", "FK", "users.id, nullable"),
    ("timestamp", "created_at", "", ""),
], "")

# ---------- 03 Distribution & Respondents
ent("03", "FORM_INVITATIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("string", "email", "", "lower-cased"),
    ("char", "token_hash", "", "sha256 of emailed token"),
    ("enum", "status", "", "pending | sent | opened | responded | revoked"),
    ("bigint", "invited_by", "FK", "users.id"),
    ("timestamp", "sent_at", "", ""),
    ("timestamp", "opened_at", "", ""),
    ("timestamp", "responded_at", "", ""),
    ("timestamp", "expires_at", "", "nullable"),
], "Private forms only. UNIQUE(form_id, email). OTP still required; the invite only authorises the email.")

ent("03", "RESPONDENTS", [
    ("bigint", "id", "PK", ""),
    ("string", "email", "UK", "lower-cased"),
    ("timestamp", "email_verified_at", "", "first successful OTP"),
    ("timestamp", "last_seen_at", "", ""),
    ("timestamp", "created_at", "", ""),
], "Global (not tenant-scoped). Holds no tenant data, only a verified email identity.")

ent("03", "RESPONDENT_OTPS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", "OTP is bound to one form"),
    ("string", "email", "", ""),
    ("char", "code_hash", "", "6-digit code, hashed"),
    ("tinyint", "attempts_used", "", "max 5"),
    ("timestamp", "expires_at", "", "10 minutes"),
    ("timestamp", "consumed_at", "", ""),
    ("string", "ip", "", ""),
    ("timestamp", "created_at", "", ""),
], "Requested only after Cloudflare Turnstile passes. Rate-limited per IP and per email. Pruned by a daily job.")

# ---------- 04 Attempts & Integrity
ent("04", "FORM_ATTEMPTS", [
    ("ulid", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("ulid", "form_id", "FK", ""),
    ("bigint", "form_version_id", "FK", "version rendered to this respondent"),
    ("bigint", "respondent_id", "FK", ""),
    ("bigint", "invitation_id", "FK", "private forms, nullable"),
    ("ulid", "response_id", "FK", "set when purpose = edit"),
    ("enum", "purpose", "", "new | edit"),
    ("char", "token_hash", "", "attempt session token"),
    ("string", "active_key", "", "respondent_id while in_progress, else NULL"),
    ("enum", "status", "", "in_progress | submitted | expired | voided | abandoned"),
    ("json", "rules_snapshot", "", "form settings frozen at start"),
    ("timestamp", "started_at", "", "set when Start + fullscreen succeeds"),
    ("timestamp", "deadline_at", "", "whole_form timer, server clock"),
    ("timestamp", "ended_at", "", ""),
    ("string", "current_section_key", "", ""),
    ("json", "visited_sections", "", "ordered path, used to validate logic"),
    ("json", "draft_answers", "", "autosave, cleared on submit"),
    ("string", "active_tab_id", "", "owner tab of the session"),
    ("timestamp", "last_heartbeat_at", "", "every 10s"),
    ("int", "violation_count", "", ""),
    ("string", "ip", "", "kept for life of response (D3)"),
    ("string", "user_agent", "", ""),
    ("enum", "device_class", "", "desktop | tablet | mobile"),
    ("boolean", "fullscreen_supported", "", "false on iOS Safari"),
], "UNIQUE(form_id, active_key) allows only one in-progress attempt per respondent per form; MySQL permits many NULLs.")

ent("04", "FORM_ATTEMPT_SECTIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "attempt_id", "FK", ""),
    ("string", "section_key", "", "from definition"),
    ("enum", "status", "", "open | completed | timed_out | skipped"),
    ("timestamp", "started_at", "", ""),
    ("timestamp", "deadline_at", "", "per_section timer, server clock"),
    ("timestamp", "completed_at", "", ""),
], "Rows only for timer_mode = per_section. A timed_out section is locked. UNIQUE(attempt_id, section_key).")

ent("04", "FORM_ATTEMPT_EVENTS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "attempt_id", "FK", ""),
    ("enum", "type", "", "tab_hidden | second_tab | fullscreen_exit | copy_attempt | paste_attempt | context_menu | focus_lost | heartbeat_gap | bot_signal"),
    ("boolean", "is_violation", "", "counts toward violation_limit"),
    ("string", "tab_id", "", ""),
    ("json", "meta", "", "duration hidden, section, etc."),
    ("timestamp", "client_at", "", "browser time, display only"),
    ("timestamp", "server_at", "", "authoritative"),
], "Append-only integrity log, shown to owners per response.")

# ---------- 05 Responses & Answers
ent("05", "FORM_RESPONSES", [
    ("ulid", "id", "PK", ""),
    ("bigint", "organization_id", "FK", "tenant"),
    ("ulid", "form_id", "FK", ""),
    ("bigint", "respondent_id", "FK", ""),
    ("string", "email", "", "snapshot for exports"),
    ("string", "dedupe_key", "", "email when one_response, else NULL"),
    ("bigint", "location_id", "FK", "snapshot: respondent's location at submit (form location or their primary)"),
    ("bigint", "current_revision_id", "FK", "latest revision, NULL when voided by violation"),
    ("enum", "status", "", "submitted | voided"),
    ("enum", "void_reason", "", "violation | owner, nullable"),
    ("bigint", "voided_by", "FK", "users.id, NULL for violation voids"),
    ("timestamp", "voided_at", "", ""),
    ("int", "revision_count", "", ""),
    ("int", "violation_count", "", "from latest attempt"),
    ("boolean", "flagged", "", "integrity events present"),
    ("timestamp", "first_submitted_at", "", ""),
    ("timestamp", "last_submitted_at", "", ""),
], "UNIQUE(form_id, dedupe_key) enforces one response per email at DB level. A violation void still inserts a row (status voided, no revision) so the one-response chance is used up (D1). Owner reset = clear dedupe_key. Voided rows never appear in summaries.")

ent("05", "RESPONSE_REVISIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "response_id", "FK", ""),
    ("ulid", "attempt_id", "FK", "attempt that produced it"),
    ("bigint", "form_version_id", "FK", ""),
    ("int", "revision_no", "", "1 = original submit"),
    ("enum", "submit_reason", "", "manual | timer_expired | violation_limit"),
    ("int", "duration_seconds", "", "started_at to submit"),
    ("timestamp", "submitted_at", "", ""),
], "A new row per edit-after-submit. UNIQUE(response_id, revision_no).")

ent("05", "RESPONSE_ANSWERS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", "denormalised for summaries"),
    ("ulid", "response_id", "FK", ""),
    ("bigint", "revision_id", "FK", ""),
    ("string", "section_key", "", ""),
    ("string", "question_key", "", "stable across versions"),
    ("string", "row_key", "", "grid types only"),
    ("string", "option_key", "", "choice types"),
    ("smallint", "value_int", "", "scale and rating types"),
    ("boolean", "is_current", "", "1 on latest revision only"),
], "Checkboxes write one row per ticked option. INDEX(form_id, is_current, question_key, option_key) and INDEX(form_id, is_current, question_key, value_int).")

# ---------- 06 Notifications, Integrations & Exports
ent("06", "FORM_NOTIFICATION_SUBSCRIPTIONS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("bigint", "user_id", "FK", ""),
    ("enum", "frequency", "", "instant | daily_digest | off"),
    ("timestamp", "created_at", "", ""),
], "UNIQUE(form_id, user_id).")

ent("06", "FORM_WEBHOOKS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("string", "url", "", "https only"),
    ("string", "secret", "", "encrypted, HMAC-SHA256 signing"),
    ("json", "events", "", "response.submitted, response.updated"),
    ("boolean", "is_active", "", ""),
    ("bigint", "created_by", "FK", "users.id"),
    ("timestamp", "created_at", "", ""),
], "")

ent("06", "WEBHOOK_DELIVERIES", [
    ("bigint", "id", "PK", ""),
    ("bigint", "webhook_id", "FK", ""),
    ("ulid", "response_id", "FK", ""),
    ("string", "event", "", ""),
    ("enum", "status", "", "pending | success | failed"),
    ("smallint", "http_status", "", ""),
    ("tinyint", "attempt_count", "", "max 6, exponential backoff"),
    ("timestamp", "next_retry_at", "", ""),
    ("text", "last_error", "", ""),
    ("timestamp", "created_at", "", ""),
], "")

ent("06", "FORM_EXPORTS", [
    ("bigint", "id", "PK", ""),
    ("ulid", "form_id", "FK", ""),
    ("bigint", "requested_by", "FK", "users.id"),
    ("enum", "format", "", "xlsx | csv"),
    ("enum", "status", "", "queued | processing | ready | failed"),
    ("string", "file_path", "", "private disk"),
    ("int", "row_count", "", ""),
    ("timestamp", "expires_at", "", "signed download, 24h"),
    ("timestamp", "created_at", "", ""),
], "")

# relationships: (left, card, right, label, owning_section)
R = [
    ("ORGANIZATIONS", "||--o{", "ORGANIZATION_USERS", "has members", "01"),
    ("USERS", "||--o{", "ORGANIZATION_USERS", "joins", "01"),
    ("USERS", "||--o{", "ORGANIZATIONS", "owns", "01"),
    ("USERS", "||--o{", "USER_TRUSTED_DEVICES", "remembers", "01"),
    ("ORGANIZATIONS", "|o--o{", "ROLES", "defines custom", "01"),
    ("ROLES", "||--o{", "ORGANIZATION_USERS", "main role of", "01"),
    ("STATUSES", "||--o{", "USERS", "status of", "01"),
    ("STATUSES", "||--o{", "ORGANIZATIONS", "status of", "01"),
    ("STATUSES", "||--o{", "ROLES", "status of", "01"),
    ("MENUS", "|o--o{", "MENUS", "parent of", "01"),
    ("ORGANIZATIONS", "||--o{", "IMPERSONATION_SESSIONS", "audits", "01"),
    ("USERS", "||--o{", "IMPERSONATION_SESSIONS", "views as", "01"),
    ("ROLES", "|o--o{", "IMPERSONATION_SESSIONS", "previewed in", "01"),
    ("LOCATIONS", "|o--o{", "IMPERSONATION_SESSIONS", "context of", "01"),

    ("ORGANIZATIONS", "||--o{", "LOCATIONS", "has", "01B"),
    ("LOCATIONS", "|o--o|", "ORGANIZATIONS", "is root of", "01B"),
    ("LOCATION_TYPES", "||--o{", "LOCATIONS", "classifies", "01B"),
    ("ORGANIZATIONS", "|o--o{", "LOCATION_TYPES", "defines", "01B"),
    ("LOCATIONS", "|o--o{", "LOCATIONS", "parent of", "01B"),
    ("LOCATIONS", "||--o{", "LOCATION_CLOSURES", "ancestor in", "01B"),
    ("STATUSES", "||--o{", "LOCATIONS", "status of", "01B"),
    ("WARDS", "|o--o{", "LOCATIONS", "places", "01B"),
    ("COUNTRIES", "|o--o{", "LOCATIONS", "places", "01B"),
    ("USERS", "||--o{", "USER_LOCATIONS", "assigned at", "01B"),
    ("LOCATIONS", "||--o{", "USER_LOCATIONS", "staffed by", "01B"),

    ("ORGANIZATIONS", "||--o{", "REQUEST_TYPES", "defines", "01C"),
    ("REQUEST_TYPES", "||--|{", "REQUEST_TYPE_STEPS", "has steps", "01C"),
    ("REQUEST_TYPES", "||--o{", "REQUESTS", "typed as", "01C"),
    ("USERS", "||--o{", "REQUESTS", "raises", "01C"),
    ("LOCATIONS", "||--o{", "REQUESTS", "routes", "01C"),
    ("REQUESTS", "||--o{", "REQUEST_APPROVALS", "decided by", "01C"),
    ("REQUEST_TYPE_STEPS", "||--o{", "REQUEST_APPROVALS", "step of", "01C"),
    ("USERS", "||--o{", "REQUEST_APPROVALS", "approves", "01C"),
    ("USERS", "||--o{", "APPROVAL_DELEGATIONS", "delegates", "01C"),
    ("REQUEST_TYPES", "|o--o{", "APPROVAL_DELEGATIONS", "limits", "01C"),
    ("APPROVAL_DELEGATIONS", "|o--o{", "REQUEST_APPROVALS", "acted under", "01C"),
    ("REQUESTS", "||--o{", "NOTIFICATION_DELIVERIES", "notifies", "01C"),
    ("USERS", "||--o{", "NOTIFICATION_DELIVERIES", "receives", "01C"),
    ("USERS", "||--o{", "USER_NOTIFICATION_PREFERENCES", "sets", "01C"),

    ("ORGANIZATIONS", "||--o{", "FORMS", "owns", "02"),
    ("USERS", "||--o{", "FORMS", "creates", "02"),
    ("LOCATIONS", "|o--o{", "FORMS", "owns", "02"),
    ("FORMS", "||--o{", "FORM_VERSIONS", "versioned as", "02"),
    ("FORM_VERSIONS", "|o--o|", "FORMS", "is live version of", "02"),
    ("USERS", "||--o{", "FORM_VERSIONS", "publishes", "02"),
    ("FORMS", "||--o{", "FORM_COLLABORATORS", "shared with", "02"),
    ("USERS", "||--o{", "FORM_COLLABORATORS", "collaborates", "02"),
    ("ORGANIZATIONS", "|o--o{", "FORM_TEMPLATES", "keeps", "02"),
    ("USERS", "|o--o{", "FORM_TEMPLATES", "authors", "02"),

    ("FORMS", "||--o{", "FORM_INVITATIONS", "invites", "03"),
    ("USERS", "||--o{", "FORM_INVITATIONS", "sends", "03"),
    ("FORMS", "||--o{", "RESPONDENT_OTPS", "issues", "03"),

    ("ORGANIZATIONS", "||--o{", "FORM_ATTEMPTS", "scopes", "04"),
    ("FORMS", "||--o{", "FORM_ATTEMPTS", "receives", "04"),
    ("FORM_VERSIONS", "||--o{", "FORM_ATTEMPTS", "rendered as", "04"),
    ("RESPONDENTS", "||--o{", "FORM_ATTEMPTS", "starts", "04"),
    ("FORM_INVITATIONS", "|o--o{", "FORM_ATTEMPTS", "authorises", "04"),
    ("FORM_RESPONSES", "|o--o{", "FORM_ATTEMPTS", "edited via", "04"),
    ("FORM_ATTEMPTS", "||--o{", "FORM_ATTEMPT_SECTIONS", "times", "04"),
    ("FORM_ATTEMPTS", "||--o{", "FORM_ATTEMPT_EVENTS", "logs", "04"),

    ("ORGANIZATIONS", "||--o{", "FORM_RESPONSES", "scopes", "05"),
    ("FORMS", "||--o{", "FORM_RESPONSES", "collects", "05"),
    ("RESPONDENTS", "||--o{", "FORM_RESPONSES", "submits", "05"),
    ("LOCATIONS", "|o--o{", "FORM_RESPONSES", "snapshotted at", "05"),
    ("USERS", "|o--o{", "FORM_RESPONSES", "voids", "05"),
    ("FORM_RESPONSES", "||--|{", "RESPONSE_REVISIONS", "revised as", "05"),
    ("RESPONSE_REVISIONS", "|o--o|", "FORM_RESPONSES", "is current of", "05"),
    ("FORM_ATTEMPTS", "||--o|", "RESPONSE_REVISIONS", "produces", "05"),
    ("FORM_VERSIONS", "||--o{", "RESPONSE_REVISIONS", "answered on", "05"),
    ("RESPONSE_REVISIONS", "||--|{", "RESPONSE_ANSWERS", "contains", "05"),
    ("FORM_RESPONSES", "||--o{", "RESPONSE_ANSWERS", "holds", "05"),
    ("FORMS", "||--o{", "RESPONSE_ANSWERS", "summarised from", "05"),

    ("FORMS", "||--o{", "FORM_NOTIFICATION_SUBSCRIPTIONS", "notifies", "06"),
    ("USERS", "||--o{", "FORM_NOTIFICATION_SUBSCRIPTIONS", "subscribes", "06"),
    ("FORMS", "||--o{", "FORM_WEBHOOKS", "pushes to", "06"),
    ("USERS", "||--o{", "FORM_WEBHOOKS", "configures", "06"),
    ("FORM_WEBHOOKS", "||--o{", "WEBHOOK_DELIVERIES", "delivers", "06"),
    ("FORM_RESPONSES", "||--o{", "WEBHOOK_DELIVERIES", "triggers", "06"),
    ("FORMS", "||--o{", "FORM_EXPORTS", "exported as", "06"),
    ("USERS", "||--o{", "FORM_EXPORTS", "requests", "06"),
]

DEFINITION_JSON = '''{
  "schema": 1,
  "sections": [
    {
      "key": "sec_01J9X...",
      "title": "Basics",
      "description": null,
      "time_limit_seconds": 300,            // per_section mode only
      "next": "auto",                       // auto | <section_key> | "submit"
      "questions": [
        {
          "key": "q_01J9X...",
          "type": "single_choice",          // single_choice | multi_choice | true_false
                                            // dropdown | linear_scale | rating
                                            // choice_grid | checkbox_grid
          "title": "Which branch do you work at?",
          "required": true,
          "shuffle_options": false,
          "options": [
            { "key": "opt_01J9X...", "label": "Arusha", "go_to": "sec_01J9Y..." },
            { "key": "opt_01J9Z...", "label": "Dodoma", "go_to": "submit" }
          ],
          "validation": { "min_selected": null, "max_selected": null }
        },
        {
          "key": "q_01JA0...",
          "type": "linear_scale",
          "title": "How satisfied are you?",
          "required": true,
          "scale": { "min": 1, "max": 5, "min_label": "Poor", "max_label": "Great" }
        },
        {
          "key": "q_01JA1...",
          "type": "choice_grid",
          "title": "Rate each service",
          "rows":    [ { "key": "row_01...", "label": "Delivery" } ],
          "columns": [ { "key": "opt_01...", "label": "Good" } ]
        }
      ]
    }
  ]
}'''

STORAGE_MAP = [
    ("single_choice / true_false / dropdown", "1 row: option_key"),
    ("multi_choice (checkboxes)", "1 row per ticked option: option_key"),
    ("linear_scale / rating", "1 row: value_int"),
    ("choice_grid", "1 row per grid row: row_key + option_key"),
    ("checkbox_grid", "1 row per ticked cell: row_key + option_key"),
]

CONSTRAINTS = [
    ("form_responses", "UNIQUE(form_id, dedupe_key)", "One response per email when one_response = 1. dedupe_key stays NULL otherwise, so the index does not block multi-response forms."),
    ("form_attempts", "UNIQUE(form_id, active_key)", "Only one in-progress attempt per respondent per form. active_key is cleared when the attempt ends."),
    ("response_answers", "INDEX(form_id, is_current, question_key, option_key)", "Powers the choice summaries with a single GROUP BY."),
    ("response_answers", "INDEX(form_id, is_current, question_key, value_int)", "Powers scale and rating averages and histograms."),
    ("form_versions", "UNIQUE(form_id, version_no)", "Versions are immutable; edits to a live form publish a new number."),
    ("form_invitations", "UNIQUE(form_id, email)", "One invitation per email per form; re-send updates the same row."),
    ("forms", "CHECK allow_edit = 0 WHEN timer_mode <> 'off'", "Enforced in a FormRequest and a model saving hook; MySQL CHECK as a backstop."),
    ("user_locations", "UNIQUE(user_id, location_id)", "One assignment row per user per location; roles and overrides live inside it."),
    ("user_locations", "INDEX((CAST(roles AS UNSIGNED ARRAY)))", "Multi-valued index for 'who holds role X here' (D20); same for granted/denied_permissions as CHAR(80) ARRAY."),
    ("location_closures", "PRIMARY(ancestor_id, descendant_id), INDEX(descendant_id, depth)", "Subtree and ancestor lookups in one indexed query (D21, D23)."),
    ("forms", "INDEX(organization_id, location_id, status)", "Location-scoped form lists for managers."),
    ("all tenant tables", "INDEX(organization_id, ...)", "Leading organization_id on list indexes; global scope adds it to every builder query."),
]

LIFECYCLES = [
    ("FORMS.status", "draft → published → closed → archived", "closed → published reopens. Publish creates a FORM_VERSIONS row each time."),
    ("FORM_ATTEMPTS.status", "in_progress → submitted | expired | voided | abandoned", "expired = deadline passed (answers auto-submitted unless empty). voided = violation_policy void. Tab closed on a timed form: resume_policy resume keeps it in_progress with the clock running; auto_submit submits on heartbeat loss. abandoned = untimed, no heartbeat for 30 min."),
    ("FORM_ATTEMPT_SECTIONS.status", "open → completed | timed_out | skipped", "skipped = conditional logic routed past it."),
    ("FORM_RESPONSES.status", "submitted → voided", "Also inserted directly as voided when violation_policy = void. Owners and admins can void; voided rows leave the summary."),
    ("FORM_INVITATIONS.status", "pending → sent → opened → responded", "revoked from any state before responded."),
    ("REQUESTS.status", "draft → submitted → in_review → approved | rejected", "cancelled by the requester before a decision. current_step advances when a step's combinator and required_approvals are met."),
    ("FORM_EXPORTS.status", "queued → processing → ready | failed", ""),
    ("WEBHOOK_DELIVERIES.status", "pending → success | failed", "Retries stay pending until attempt_count hits the limit."),
]

JOBS = [
    ("Queue", "SubmitAttemptJob", "Finalises an attempt: validates path, writes revision + answers, flips is_current, bumps counters."),
    ("Queue", "DispatchResponseNotifications", "Instant emails to subscribers on ResponseSubmitted."),
    ("Queue", "DeliverWebhook", "Signed POST with exponential backoff."),
    ("Queue", "GenerateFormExport", "Builds XLSX/CSV via Laravel Excel on a private disk."),
    ("Queue", "SendFormInvitations", "Chunks invitation emails, sets sent_at."),
    ("Cron · every minute", "ExpireTimedAttempts", "Auto-submits or expires attempts past deadline_at + grace."),
    ("Cron · every minute", "HandleLostHeartbeats", "Timed + resume_policy auto_submit: submit after 60s without heartbeat. Untimed: mark abandoned after 30 min."),
    ("Cron · every minute", "CloseScheduledForms", "Closes forms past closes_at or at max_responses."),
    ("Cron · daily", "PruneOtps / SendDailyDigest", "Deletes consumed or expired OTPs; sends digest subscriptions."),
]

OPEN_DECISIONS = [
    ("D1", "Voided attempt uses up the one-response chance", "Yes. Stored as a voided FORM_RESPONSES row; owner can reset."),
    ("D2", "Tab closed mid-attempt on a timed form", "Owner chooses per form: forms.resume_policy = resume | auto_submit."),
    ("D3", "Retention of IP, user agent, integrity events", "Life of the response; purged with the response or form."),
    ("D4", "ID strategy", "ULID for forms, attempts, responses; bigint for internal tables."),
    ("D5", "Respondent identity scope", "Global respondents table."),
    ("D6", "Summary chart views", "Three levels: built-in default per type, organisation default per type (organizations.summary_view_defaults), per-question override (forms.summary_views)."),
    ("D8", "Roles and menu access", "Cobley-style JSON roles (spatie removed). roles.permissions is a JSON array of permission names in Module.action form (Forms.list, Forms.create, Responses.export; see D28). One permission per child menu; parent visible if any child is (OR); empty parents hidden. Missing permissions go to a role first, to a single user (granted_permissions on user_locations) only as an exception."),
    ("D9", "Menus, selects and popovers never clip", "Always use shadcn-vue *Content components (DropdownMenuContent, SelectContent, PopoverContent, TooltipContent) with their portal on and collisionPadding 8. Never position a menu with absolute inside a scrolling or overflow-hidden container (tables, card lists, dialog bodies)."),
    ("D10", "Clickable cards with actions", "A card that opens on click uses a stretched link; its action buttons (menus, toggles) sit above it with relative z-10 so they stay tappable."),
    ("D11", "Tables on phones", "Below 640px every data table switches to a compact card list (forms list, responses, members). The table/cards toggle only applies from 640px up."),
    ("D12", "Server-side access matches the menu", "Every route and API endpoint behind a menu checks the same permission (Laravel middleware can:<permission>). Hidden menu = 403 on direct visit, shown as a 'No access' page with a request button."),
    ("D13", "Page transitions", "Curtain plays on first app load (starts closed with 'Loading…', opens once the app is ready; the closed curtain is in the server HTML so nothing flashes) and on every page change, sidebar navigation included (revised 10 Oct). Not between sign-in steps or between tabs inside a page. Loader appears only if the next page takes longer than 300ms. Skipped with prefers-reduced-motion and switchable off in the prototype. Curtain colour has its own tokens: bright teal (--curtain 170 62% 46%, dark text) in light mode, deep green (166 58% 13%, light text) in dark mode."),
    ("D14", "Sidebar menu animation", "Animation follows the display mode by default (dropdown: expand + stagger, panel: slide, rail flyout: fade); per-menu override in Menu Management. Dropdowns are always accordion. Forms and Configuration cannot be hidden."),
    ("D15", "Product name", "'Fomu' is a placeholder until the product is named; keep it in one config value (APP_NAME) so it can change everywhere at once."),
    ("D16", "Menu Management layout", "The page is information only: parent/child rows (drag to reorder, drag a child onto another parent to move it) showing type, permission, who sees it and status. All editing happens in a gear popup: name, icon, parent, position, group heading, display mode, animation, permission and visibility. Parents stay top level."),
    ("D17", "Design system reference", "The prototype's Design system page is the source of truth for tokens (colour, type, spacing, radius, shadow, motion, z-index, breakpoints), the component inventory with sizes and variants, and layout rules. The build copies its values into tailwind.config and the shadcn-vue theme CSS; any change is made there first."),
    ("D18", "Shared platform core", "Identity, organisations, roles, permissions, menus, statuses, locations, wards and approvals reuse the Cobley Platform core. Every tenant-owned core table gets organization_id; system rows (roles, location types, statuses) keep it NULL and are shared."),
    ("D19", "Main role vs location roles", "One MAIN role per organisation member (organization_users.role_id, role_type = system: owner, admin, editor, viewer). Several CUSTOM roles per location in user_locations.roles (JSON array of role ids, role_type = custom). A main role can never be stored as a location role; validated on save."),
    ("D20", "Overrides stay JSON", "granted_permissions / denied_permissions / roles stay JSON on user_locations. Mitigations: MySQL 8 multi-valued indexes (CAST(... AS CHAR(80) ARRAY)) for 'who has X' queries, a FormRequest rule that every value exists in permissions.name, every change written to the activity log with before/after, and a migration that renames values when a permission is renamed."),
    ("D21", "Effective permission rule", "At a location: main role permissions UNION custom-role permissions at that location and every ancestor (via location_closures) UNION granted_permissions, MINUS denied_permissions. Deny always wins. Result cached per user + location, busted when any input changes."),
    ("D22", "Statuses", "Master-data status (users, organisations, locations, roles, request types) uses the statuses table (status_id). Workflow states that drive code (forms, attempts, responses, requests) stay ENUM columns."),
    ("D23", "Forms owned by locations", "forms.location_id (NULL = organisation-wide) with include_descendants. Private forms are open only to users assigned at that location (or its descendants when included) and to invitees; public forms to anyone with the link. form_responses.location_id snapshots where the response belongs so reports survive form moves. Managers see only forms and results of their locations."),
    ("D24", "View as", "Admins with Users.impersonate can preview the app as another user or as a role (D37): read-only, a banner shows who is being viewed, no writes, no OTP or emails. Each session is recorded in impersonation_sessions (who, whom, location, started, ended)."),
    ("D25", "Approvals are core", "The Cobley approval engine (request_types, steps with role/permission/user approvers and or/and combinators, requests, request_approvals, delegations) is part of the core. First request types: Publish form, Export responses, Reset respondent. Approvers are resolved at the request's location and its ancestors."),
    ("D26", "Locations screens", "List is a tree table (expand/collapse, search keeps matching rows with their ancestors) that becomes an indented card list on phones. Detail has Overview, Details, Users and Forms tabs. Users shows direct assignments plus people inherited from above (one row per person, sources listed); roles and JSON overrides are edited in a side sheet with a live effective-permission preview. View as starts from a user row or the top bar and opens on the Forms list."),
    ("D27", "Frontend rules source", "Cobley's frontend code is discarded; its backend and its behaviour rules are kept. Where Cobley and the prototype disagree on look (list shape, fonts, theme), the prototype wins. Rules live in three places kept in sync: the Fomu frontend rules doc, FRONTEND_RULES.md in the repo (read by CLAUDE.md), and the Rules tab on the prototype's Design system page."),
    ("D28", "Permission action names", "Module.action with Cobley's verbs: list (was view), view (one record), create, edit, delete, plus module-specific actions (Forms.publish, Responses.export, Users.impersonate). Menus are gated by Module.list."),
    ("D29", "Contextual search", "The top-bar search box follows the page. Inside a module it searches that module only and filters the list in place through the module's own search filter (kept in the URL); a last line offers 'Search everywhere for ...'. On a details page it searches the parent module and shows a small dropdown. On pages with nothing to search the box is hidden. Every module declares a search filter field."),
    ("D30", "Global search and Dashboard", "A Dashboard is the new home page. Its search is global: GET /search?q= runs each searchable module's existing select search and returns the top 5 per module, permission- and location-scoped, grouped with 'See all in X' links that open the filtered list. On phones a search icon expands into a full-width bar; on the Dashboard results open full screen with recent searches."),
    ("D31", "List toolbar", "Order: Refresh, Filters (n), Clear, Sort, then the cards/table toggle and the primary New button on the right; Export/Import only when the backend has them. Filters dialog has Simple (natural operator per field) and Advanced (operator per field) modes; one request on Apply; filters, sort and page live in the URL. Status tabs stay as quick filters and stay in sync with the dialog. On phones the toolbar shows icons with counts and the dialog opens as a bottom sheet."),
    ("D32", "Refresh everywhere", "Every viewable page (lists, details, results, dashboard) has a Refresh button with an 'Updated x ago' hint. Refreshing keeps the current content on screen, dimmed, until new data arrives; only a first load with nothing on screen shows a spinner."),
    ("D33", "Shared form behaviour from Cobley", "Server-side drafts on every create/edit form (autosave 4s; create keeps several drafts with a picker; edit keeps one with a restore banner; never files or secrets; never in action wizards). No native pickers (select, file, date, time). Deletes need 'type YES'. Required fields use a CSS asterisk. Modals open through one modal host. Details tabs live in ?tab=. Related records open as a preview of the target's own details panel."),
    ("D34", "Approvals screens", "Approvals menu: Inbox (Waiting for me / My requests / All or My locations) and Delegations; Configuration › Approval workflows. Request page shows the step timeline with resolved approvers and why, approve/reject (reason required), delegation labels and terminal banners. Actions behind an active workflow offer 'Request to …'. Nobody qualifying at the location chain escalates to owners and admins."),
    ("D35", "Component library", "COMPONENTS.md is generated from the prototype's component inventory (specs) and components_api.json (props, emits, slots, do/don't). Screens are built only from it; a missing control is added to the library first. Contracts used by another module are extended, never changed."),
    ("D36", "API select paging and labels", "Mixed paging per module: page= for small tables, opaque after= cursor for big or busy ones; has_more instead of totals; next page loads when an end marker scrolls into view. Selected labels: view endpoints return foreign keys as { id, label, sub } (selected-options), then one batched ids[] lookup per module per tick, then a shared label store. Current choices pinned on page 1. Archived, restricted and deleted values stay, flagged, with a warning; never cleared silently. 60-second cache with background refresh."),
    ("D37", "View as: person or role", "View as has two read-only modes: a real person, or a role preview built from a main role plus an optional custom role at a location (no real person; a synthetic member that is never listed). Roles page offers 'Preview this role'. Full 'Act as' impersonation with write access is not part of Fomu. impersonation_sessions records role previews with viewed_user_id NULL and the role + location viewed."),
    ("D38", "Filter controls by data size", "List filterFields declare select (short fixed sets, 10 or fewer, shown as pills) or select_paginated (anything that grows: locations, people, forms, wards), which renders a multi API select for its module. Location filters include descendants by default via location_closures, with a switch; the chip reads 'and below'. The list endpoint receives filters[loc][operator]=in&filters[loc][value][]=…&filters[loc][below]=1."),
    ("D39", "Roles as list + details", "Roles follow the core-module shape. /roles is a list (KPIs, All/Main/Custom tabs, toolbar with refresh, filters for type, people and permission count, sort; rows show permission coverage, visible menus and holders). /roles/{id} is a details page: Overview (KPIs, permissions by module, about + timeline, holders), Permissions, Menus, People, History; tab in ?tab=. Header promotes Preview this role next to Edit (the role's defining action, like Add child on a location); Copy permissions from, Duplicate and Delete sit in More. Main role names are fixed; only custom roles can be created, renamed or deleted, and delete is blocked while anyone holds the role at a location (role_user_location rows). Permission ticks save immediately and apply on the next request. GET /roles returns perms_count, holders_count, menus_visible; GET /roles/{id}/holders returns main-role users or custom-role holders with their locations."),
    ("D40", "Short approver steps", "A step needing 2+ approvals must have at least required + 1 people who can approve anywhere in the org, because the requester never approves their own request; single-approval steps need 1 (escalation to owners and admins covers the rest). The workflow editor shows the count, blocks Save and blocks switching it on. Existing workflows that fail are flagged “Can’t be met”; at runtime a short step adds the Owner, needs only as many approvals as people can give, and an Owner can complete a step that already has every approval it can get (logged as is_owner_override)."),
    ("D41", "Results actions behind approvals", "Export responses and Reset respondent (Responses.export / Responses.void) check for an active workflow first. If one applies, the button opens “This needs approval” with the subject (form, format, row count, or respondent), the route preview and a note; the action runs by itself when approved. An open request for the same subject blocks a duplicate. Reset buttons read “Request another attempt” and show “Reset requested” with the request number while it is open. No workflow = the action runs directly with its normal confirm."),
    ("D42", "Staged role edits", "Permission and menu ticks on a role are staged. A sticky bar shows +added / −removed and how many people it affects, with Discard and Save. Copy permissions from stages too. Leaving with unsaved changes (any nav, breadcrumb, sidebar, search, or closing the tab) asks Stay / Discard and leave / Save and leave. Save is one PUT /roles/{id}/permissions with the full set and is audited as one change."),
    ("D43", "Approval notifications", "Channels: in-app (always), email, SMS via NJIWA, push (NativePHP). Workflow sets default channels and events: step waiting (approvers), reminder every N hours up to M times (approvers who have not acted), escalation or short step (Owner), decision (requester). A step may override channels and mark them required. People opt out of email/SMS/push in Notification settings; required steps ignore that. Every send is a notification_deliveries row (sent or skipped with reason) shown on the request’s Notifications tab; requesters and admins can send a reminder now. Email carries a link to the request, never one-click approve."),
    ("D44", "Approval email and quiet hours", "Approval emails carry a link to the request only; approvers sign in (with 2FA) to decide. No signed one-click links. Organisations set quiet hours (default 20:00–07:00 EAT, on): SMS and push raised inside the window are held (notification_deliveries.status = held) and sent when it ends; in-app and email go at once; steps marked notify_required ignore quiet hours. Stored in organizations.settings.quiet_hours {on, from, to}."),
    ("D45", "Repository and stack", "Monorepo joelnjoshkibona/fomu: api/ = Laravel (laravel/framework ^13, inherited from the Cobley backend, which is the base; Cobley modules Fomu does not need are removed in Phase 0), web/ = Vue 3 + Vite + TypeScript + Tailwind + shadcn-vue SPA. docs/ holds the runnable prototype (the visual source of truth), screenshots, decisions, ERD, frontend rules and component specs. Work is delivered in phases, one PR each, with screenshots compared against the prototype."),
    ("D7", "Admin sign-in", "Email, phone or username + password, then TOTP 2FA (Fortify). Optional 30-day trusted device; org can require 2FA."),
]
OPEN_DECISIONS.sort(key=lambda d: int(d[0][1:]))
