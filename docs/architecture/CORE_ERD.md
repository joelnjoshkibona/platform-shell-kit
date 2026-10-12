# Core ERD (platform)

> The tables every product inherits from the Cobley core, scoped by organization_id: identity and access, locations, approvals and notifications, plus the shared constraints, lifecycles and jobs. A product adds its own sections (02+) in its own ERD. Generated from the Fomu ERD; regenerate from architecture/erd_data.py when the core changes.

## 01. Platform core: identity & access

Shared kernel with Cobley (same table and column names) plus organization_id for tenancy. Users, statuses, organisations, roles with JSON permissions, menus. Builder URLs are path-based: /{org.slug}/forms.

```mermaid
erDiagram
    STATUSES {
        bigint id PK
        string name UK "Active, Pending, Inactive, Suspended..."
        string color "default #6b7280"
        text description
    }
    USERS {
        bigint id PK
        string name
        string username UK "sign-in identifier"
        string email UK "sign-in identifier, nullable"
        string phone UK "E.164, sign-in identifier, nullable"
        string password "hashed"
        timestamp password_set_at "Cobley core"
        bigint status_id FK "statuses.id"
        datetime last_logged_in_at "Cobley core"
        text two_factor_secret "Fomu addition: encrypted TOTP secret"
        text two_factor_recovery_codes "Fomu addition, encrypted"
        timestamp two_factor_confirmed_at "Fomu addition; NULL = 2FA off"
        enum theme_preference "light | dark | system"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    USER_TRUSTED_DEVICES {
        bigint id PK
        bigint user_id FK
        char token_hash "cookie token, sha256"
        string device_name "parsed user agent"
        string ip
        timestamp last_used_at
        timestamp expires_at "30 days"
    }
    ORGANIZATIONS {
        bigint id PK
        ulid public_id UK "exposed in API"
        string name
        string slug UK "path segment /{org}"
        bigint root_location_id FK "locations.id of type organization"
        json branding "logo, accent colour, default theme"
        string timezone "default Africa/Dar_es_Salaam"
        json summary_view_defaults "per question type chart view"
        boolean require_2fa
        bigint status_id FK "statuses.id"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    ORGANIZATION_USERS {
        bigint id PK
        bigint organization_id FK
        bigint user_id FK
        bigint role_id FK "MAIN role (role_type = system): owner | admin | editor | viewer"
        boolean is_owner "exactly one per org; owner role locked"
        timestamp joined_at
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    ROLES {
        bigint id PK
        bigint organization_id FK "NULL = system role shared by all orgs"
        string name "UNIQUE(organization_id, name)"
        text description
        string role_type "system (main roles) | custom (location roles); Cobley column"
        bigint status_id FK "statuses.id"
        json permissions "array of permission names; Cobley core"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    PERMISSIONS {
        bigint id PK
        string name UK "Module.action, e.g. Logs.view, Responses.export"
        string title "human name shown in Roles"
        string module "grouping in the Roles checklist"
        text description
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    MENUS {
        bigint id PK
        bigint parent_id FK "self, NULL = top level"
        string title
        string url "NULL for parents"
        string icon "lucide name"
        json permission "Cobley core; children hold exactly one name (D8), parents NULL"
        string module_route "Cobley core"
        int position "sort order"
        boolean is_active "hidden for everyone when 0"
        string group_label "Fomu addition: heading inside a panel"
        enum display_mode "Fomu addition: dropdown | panel | section"
        enum animation "Fomu addition: default | stagger | fade | slide | none"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    IMPERSONATION_SESSIONS {
        bigint id PK
        bigint organization_id FK
        bigint admin_user_id FK "users.id, who is looking"
        enum mode "person | role (D37)"
        bigint viewed_user_id FK "users.id, whose view; NULL for a role preview"
        string viewed_main_role "role preview: owner | admin | editor | viewer"
        bigint viewed_role_id FK "roles.id, custom role previewed; nullable"
        bigint location_id FK "context location, nullable"
        string reason "optional"
        string ip
        timestamp started_at
        timestamp ended_at
    }

    ORGANIZATIONS ||--o{ ORGANIZATION_USERS : "has members"
    USERS ||--o{ ORGANIZATION_USERS : "joins"
    USERS ||--o{ ORGANIZATIONS : "owns"
    USERS ||--o{ USER_TRUSTED_DEVICES : "remembers"
    ORGANIZATIONS |o--o{ ROLES : "defines custom"
    ROLES ||--o{ ORGANIZATION_USERS : "main role of"
    STATUSES ||--o{ USERS : "status of"
    STATUSES ||--o{ ORGANIZATIONS : "status of"
    STATUSES ||--o{ ROLES : "status of"
    MENUS |o--o{ MENUS : "parent of"
    ORGANIZATIONS ||--o{ IMPERSONATION_SESSIONS : "audits"
    USERS ||--o{ IMPERSONATION_SESSIONS : "views as"
    ROLES |o--o{ IMPERSONATION_SESSIONS : "previewed in"
    LOCATIONS |o--o{ IMPERSONATION_SESSIONS : "context of"
```

- **STATUSES**: Cobley core. Master-data tables (users, organisations, locations, roles, request types) use status_id. Workflow states (forms, attempts, responses, requests) stay as enums.
- **USERS**: Cobley users + Fomu 2FA columns. Global: one user can belong to several organisations. Related Cobley auth tables kept as-is: otps, user_invitations, force_password_resets, personal_access_tokens, user_device_tokens.
- **USER_TRUSTED_DEVICES**: Fomu addition. Skips the 2FA step on a remembered device.
- **ORGANIZATIONS**: Fomu tenant. Every tenant-owned table carries organization_id behind a global scope. The org is also the root node of its location tree.
- **ORGANIZATION_USERS**: Membership + the user's one main role in this organisation. Location-specific custom roles live on user_locations. UNIQUE(organization_id, user_id).
- **ROLES**: Cobley roles + organization_id. System roles are assigned on organization_users; custom roles only on user_locations (never as a main role). Multi-valued index on permissions.
- **PERMISSIONS**: Cobley core catalogue, seeded by the app (Cobley's Module.action naming). Global, not editable by tenants.
- **MENUS**: Cobley menus + three display columns. Parent visible when ANY child is visible (OR).
- **IMPERSONATION_SESSIONS**: Fomu addition: audit for 'View as'. Read-only mode; every write is refused while a session is open.


## 01B. Platform core: locations

Cobley location tree (parent_id + closure table, typed by location_types) scoped per organisation. user_locations carries several custom roles per location plus JSON grants and denials. Reference lists: countries, wards.

```mermaid
erDiagram
    LOCATION_TYPES {
        bigint id PK
        bigint organization_id FK "NULL = system type"
        string name "organization, company, zone, cluster, branch, shop, warehouse"
        string code "UNIQUE(organization_id, code)"
        string color "badge colour"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    LOCATIONS {
        bigint id PK
        bigint organization_id FK "tenant"
        string name "UNIQUE(organization_id, name)"
        string code "UNIQUE(organization_id, code), e.g. ARU-01"
        bigint location_type_id FK
        bigint parent_id FK "self, NULL only for the org root"
        boolean allow_sales "Cobley core (unused by Fomu)"
        bigint status_id FK "statuses.id"
        string address "Fomu addition"
        bigint ward_id FK "wards.id (Tanzanian ward, district, region)"
        bigint country_id FK "countries.id"
        string phone
        string email
        decimal latitude
        decimal longitude
        json opening_hours "{mon: ['08:00','18:00'], ...}"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    LOCATION_CLOSURES {
        bigint ancestor_id PK, FK "locations.id"
        bigint descendant_id PK, FK "locations.id"
        int depth "0 = self"
    }
    USER_LOCATIONS {
        char id PK "uuid()"
        bigint user_id FK
        bigint location_id FK
        boolean is_primary "one primary per user per organisation"
        json roles "several CUSTOM role ids (role_type = custom)"
        json granted_permissions "extra permission names at this location"
        json denied_permissions "removed here; deny always wins"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    COUNTRIES {
        bigint id PK
        string iso UK
        string name UK
        string iso3
        string phonecode
    }
    WARDS {
        bigint id PK
        string name
        string code
        string district
        bigint district_id
        string region
        bigint region_id
    }

    ORGANIZATIONS ||--o{ LOCATIONS : "has"
    LOCATIONS |o--o| ORGANIZATIONS : "is root of"
    LOCATION_TYPES ||--o{ LOCATIONS : "classifies"
    ORGANIZATIONS |o--o{ LOCATION_TYPES : "defines"
    LOCATIONS |o--o{ LOCATIONS : "parent of"
    LOCATIONS ||--o{ LOCATION_CLOSURES : "ancestor in"
    STATUSES ||--o{ LOCATIONS : "status of"
    WARDS |o--o{ LOCATIONS : "places"
    COUNTRIES |o--o{ LOCATIONS : "places"
    USERS ||--o{ USER_LOCATIONS : "assigned at"
    LOCATIONS ||--o{ USER_LOCATIONS : "staffed by"
```

- **LOCATION_TYPES**: Cobley core + organization_id so tenants can add their own types.
- **LOCATIONS**: Cobley location tree + organization_id and contact/geo columns. The manager is not stored here: it is whoever holds a Manager custom role in user_locations.
- **LOCATION_CLOSURES**: Cobley core. Every ancestor/descendant pair, so 'this location and everything under it' is one indexed query. Maintained on create/move.
- **USER_LOCATIONS**: Cobley core minus role_id (main roles stay on organization_users). Applies to the location and its descendants. UNIQUE(user_id, location_id). Multi-valued indexes on the three JSON arrays; changes written to the activity log.
- **COUNTRIES**: Cobley reference list (global).
- **WARDS**: Cobley reference list of Tanzanian wards (global).


## 01C. Platform core: approvals

Cobley approval workflow: request types with ordered steps (roles, permissions or users, OR/AND), requests per location, approval turns and delegations.

```mermaid
erDiagram
    REQUEST_TYPES {
        bigint id PK
        bigint organization_id FK "tenant"
        string name "e.g. Publish form, Export results, Reset respondent"
        string code "UNIQUE(organization_id, code)"
        text description
        boolean requires_approval "0 = auto-approve"
        decimal threshold_amount "Cobley core; NULL for Fomu types"
        bigint status_id FK "statuses.id"
        json notify_settings "D43: {channels: [in_app, email, sms, push], events: {waiting, remind, escalate, decision}, remind_hours, remind_max}; in_app always on"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    REQUEST_TYPE_STEPS {
        bigint id PK
        bigint request_type_id FK
        int step_no "1, 2, 3..."
        json approver_role_ids
        json approver_permission_ids
        json approver_user_ids
        string approver_combinator "or | and"
        int required_approvals "default 1; D40: eligible approvers must be >= required + 1 when required > 1"
        json notify_channels "D43: NULL = workflow default; else the step's own channels"
        boolean notify_required "D43: send even to people who opted out of those channels"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    REQUESTS {
        bigint id PK
        bigint organization_id FK "tenant"
        string number "UNIQUE(organization_id, number), e.g. REQ-0042"
        bigint request_type_id FK
        bigint requester_id FK "users.id"
        bigint location_id FK "where approvers are looked up"
        string subject_type "polymorphic, e.g. Form, FormExport"
        bigint subject_id
        json subject_meta "D41: e.g. export format, filters, row count; part of the duplicate-open check"
        decimal amount "nullable"
        text reason
        enum status "draft | submitted | in_review | approved | rejected | cancelled"
        int current_step
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    REQUEST_APPROVALS {
        bigint id PK
        bigint request_id FK
        int step_no
        bigint approver_user_id FK "users.id"
        bigint acted_by_user_id FK "users.id, may be a delegate"
        bigint approval_delegation_id FK "nullable"
        enum decision "pending | approved | rejected"
        text comment
        datetime acted_at
        boolean is_owner_override "D40: Owner completed a short step"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    NOTIFICATION_DELIVERIES {
        bigint id PK
        bigint organization_id FK "tenant"
        bigint user_id FK "recipient"
        string notifiable_type "polymorphic, e.g. Request"
        bigint notifiable_id
        int step_no "nullable"
        enum event "waiting | remind | escalate | decision"
        enum channel "in_app | email | sms | push"
        enum status "queued | held | sent | delivered | failed | skipped"
        string skip_reason "opted_out | no_phone | no_app | no_email"
        datetime release_at "D44: when a held SMS/push goes out"
        string provider_ref "mail id, NJIWA message id, FCM id"
        text error
        datetime sent_at
        datetime read_at "in_app only"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    USER_NOTIFICATION_PREFERENCES {
        bigint id PK
        bigint organization_id FK "tenant"
        bigint user_id FK
        string category "approvals (more later)"
        enum channel "email | sms | push (in_app can't be turned off)"
        boolean enabled "default 1"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }
    APPROVAL_DELEGATIONS {
        bigint id PK
        bigint organization_id FK "tenant"
        bigint delegator_user_id FK "users.id"
        bigint delegate_user_id FK "users.id"
        bigint request_type_id FK "NULL = all types"
        date valid_from
        date valid_to
        text reason
        enum status "active | expired | revoked"
        bigint created_by_id FK "users.id"
        bigint updated_by_id FK "users.id, nullable"
        timestamp deleted_at "soft delete"
        char uuid UK "uuid()"
    }

    ORGANIZATIONS ||--o{ REQUEST_TYPES : "defines"
    REQUEST_TYPES ||--|{ REQUEST_TYPE_STEPS : "has steps"
    REQUEST_TYPES ||--o{ REQUESTS : "typed as"
    USERS ||--o{ REQUESTS : "raises"
    LOCATIONS ||--o{ REQUESTS : "routes"
    REQUESTS ||--o{ REQUEST_APPROVALS : "decided by"
    REQUEST_TYPE_STEPS ||--o{ REQUEST_APPROVALS : "step of"
    USERS ||--o{ REQUEST_APPROVALS : "approves"
    USERS ||--o{ APPROVAL_DELEGATIONS : "delegates"
    REQUEST_TYPES |o--o{ APPROVAL_DELEGATIONS : "limits"
    APPROVAL_DELEGATIONS |o--o{ REQUEST_APPROVALS : "acted under"
    REQUESTS ||--o{ NOTIFICATION_DELIVERIES : "notifies"
    USERS ||--o{ NOTIFICATION_DELIVERIES : "receives"
    USERS ||--o{ USER_NOTIFICATION_PREFERENCES : "sets"
```

- **REQUEST_TYPES**: Cobley core + organization_id. Cannot be activated or saved while a step fails the D40 capacity rule.
- **REQUEST_TYPE_STEPS**: Cobley core. Approvers are resolved at the request's location (and its ancestors) using the effective-permission rule (D21).
- **REQUESTS**: Cobley core + organization_id. Request items (request_items) are kept for Cobley types and unused by Fomu.
- **REQUEST_APPROVALS**: Cobley core.
- **NOTIFICATION_DELIVERIES**: D43. One row per recipient x channel x event; Laravel notification channels write it; reminders are a scheduled job that reads open requests.
- **USER_NOTIFICATION_PREFERENCES**: D43. UNIQUE(organization_id, user_id, category, channel). Ignored when the step sets notify_required.
- **APPROVAL_DELEGATIONS**: Cobley core + organization_id.


## 08. Constraints & indexes

| Table | Constraint | Why |
|---|---|---|
| `form_responses` | `UNIQUE(form_id, dedupe_key)` | One response per email when one_response = 1. dedupe_key stays NULL otherwise, so the index does not block multi-response forms. |
| `form_attempts` | `UNIQUE(form_id, active_key)` | Only one in-progress attempt per respondent per form. active_key is cleared when the attempt ends. |
| `response_answers` | `INDEX(form_id, is_current, question_key, option_key)` | Powers the choice summaries with a single GROUP BY. |
| `response_answers` | `INDEX(form_id, is_current, question_key, value_int)` | Powers scale and rating averages and histograms. |
| `form_versions` | `UNIQUE(form_id, version_no)` | Versions are immutable; edits to a live form publish a new number. |
| `form_invitations` | `UNIQUE(form_id, email)` | One invitation per email per form; re-send updates the same row. |
| `forms` | `CHECK allow_edit = 0 WHEN timer_mode <> 'off'` | Enforced in a FormRequest and a model saving hook; MySQL CHECK as a backstop. |
| `user_locations` | `UNIQUE(user_id, location_id)` | One assignment row per user per location; roles and overrides live inside it. |
| `user_locations` | `INDEX((CAST(roles AS UNSIGNED ARRAY)))` | Multi-valued index for 'who holds role X here' (D20); same for granted/denied_permissions as CHAR(80) ARRAY. |
| `location_closures` | `PRIMARY(ancestor_id, descendant_id), INDEX(descendant_id, depth)` | Subtree and ancestor lookups in one indexed query (D21, D23). |
| `forms` | `INDEX(organization_id, location_id, status)` | Location-scoped form lists for managers. |
| `all tenant tables` | `INDEX(organization_id, ...)` | Leading organization_id on list indexes; global scope adds it to every builder query. |


## 09. Status lifecycles

- **FORMS.status**: draft → published → closed → archived — closed → published reopens. Publish creates a FORM_VERSIONS row each time.
- **FORM_ATTEMPTS.status**: in_progress → submitted | expired | voided | abandoned — expired = deadline passed (answers auto-submitted unless empty). voided = violation_policy void. Tab closed on a timed form: resume_policy resume keeps it in_progress with the clock running; auto_submit submits on heartbeat loss. abandoned = untimed, no heartbeat for 30 min.
- **FORM_ATTEMPT_SECTIONS.status**: open → completed | timed_out | skipped — skipped = conditional logic routed past it.
- **FORM_RESPONSES.status**: submitted → voided — Also inserted directly as voided when violation_policy = void. Owners and admins can void; voided rows leave the summary.
- **FORM_INVITATIONS.status**: pending → sent → opened → responded — revoked from any state before responded.
- **REQUESTS.status**: draft → submitted → in_review → approved | rejected — cancelled by the requester before a decision. current_step advances when a step's combinator and required_approvals are met.
- **FORM_EXPORTS.status**: queued → processing → ready | failed
- **WEBHOOK_DELIVERIES.status**: pending → success | failed — Retries stay pending until attempt_count hits the limit.


## 10. Async jobs

| Kind | Job | Does |
|---|---|---|
| Queue | `SubmitAttemptJob` | Finalises an attempt: validates path, writes revision + answers, flips is_current, bumps counters. |
| Queue | `DispatchResponseNotifications` | Instant emails to subscribers on ResponseSubmitted. |
| Queue | `DeliverWebhook` | Signed POST with exponential backoff. |
| Queue | `GenerateFormExport` | Builds XLSX/CSV via Laravel Excel on a private disk. |
| Queue | `SendFormInvitations` | Chunks invitation emails, sets sent_at. |
| Cron · every minute | `ExpireTimedAttempts` | Auto-submits or expires attempts past deadline_at + grace. |
| Cron · every minute | `HandleLostHeartbeats` | Timed + resume_policy auto_submit: submit after 60s without heartbeat. Untimed: mark abandoned after 30 min. |
| Cron · every minute | `CloseScheduledForms` | Closes forms past closes_at or at max_responses. |
| Cron · daily | `PruneOtps / SendDailyDigest` | Deletes consumed or expired OTPs; sends digest subscriptions. |

