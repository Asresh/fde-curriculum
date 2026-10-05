window.CURRICULUM_EXAMPLES = {
  1: {
    title: "Turn discovery into a measurable hypothesis",
    language: "Python",
    description: "Translate a broad request into a baseline, target, and explicit assumption. The calculation makes the proposed benefit checkable before anyone commits to a build.",
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Opportunity:
    task: str
    minutes_per_case: float
    cases_per_week: int
    expected_reduction: float

def weekly_minutes_reclaimed(item: Opportunity) -> float:
    if item.minutes_per_case < 0 or item.cases_per_week < 0:
        raise ValueError("baseline values must be non-negative")
    if not 0 <= item.expected_reduction <= 1:
        raise ValueError("reduction must be between 0 and 1")
    return item.minutes_per_case * item.cases_per_week * item.expected_reduction

pilot = Opportunity(
    task="prepare a first draft of a support reply",
    minutes_per_case=40,
    cases_per_week=50,
    expected_reduction=0.25,
)
print(f"hypothesis: reclaim {weekly_minutes_reclaimed(pilot):.0f} minutes/week")
`,
    walkthrough: [
      "The baseline describes the current work, before proposing a tool.",
      "The reduction is a hypothesis; a pilot must measure whether it happened.",
      "Keep quality, review time, and exception rate beside time saved."
    ]
  },
  2: {
    title: "Validate input and bound a service call",
    language: "Python · asyncio",
    description: "A request crossing your service boundary is untrusted. Parse it into a small typed object, reject invalid data early, and put a hard time limit around downstream work.",
    code: `from dataclasses import dataclass
import asyncio

@dataclass(frozen=True)
class Ticket:
    ticket_id: str
    body: str

def parse_ticket(raw: dict[str, object]) -> Ticket:
    ticket_id = raw.get("ticket_id")
    body = raw.get("body")
    if not isinstance(ticket_id, str) or not ticket_id.strip():
        raise ValueError("ticket_id is required")
    if not isinstance(body, str) or len(body) > 20_000:
        raise ValueError("body must be text under 20,000 characters")
    return Ticket(ticket_id=ticket_id.strip(), body=body)

async def classify(ticket: Ticket, service) -> str:
    try:
        return await asyncio.wait_for(service.classify(ticket), timeout=2.0)
    except TimeoutError as exc:
        raise RuntimeError("classification timed out; keep the ticket unchanged") from exc
`,
    walkthrough: [
      "Validation happens once, at the edge, before business logic runs.",
      "A timeout prevents one dependency from holding the whole request open.",
      "The failure message tells the caller what safe state to preserve."
    ]
  },
  3: {
    title: "Make the API contract executable",
    language: "Python · FastAPI",
    description: "Request and response models turn an API agreement into runtime validation and generated documentation. The endpoint returns a stable shape and a deliberate status code.",
    code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class IntakeRequest(BaseModel):
    subject: str = Field(min_length=3, max_length=160)
    body: str = Field(min_length=1, max_length=20_000)
    requester_id: str = Field(min_length=1, max_length=80)

class IntakeResponse(BaseModel):
    ticket_id: str
    status: str

@app.post("/v1/tickets", response_model=IntakeResponse, status_code=201)
async def create_ticket(request: IntakeRequest) -> IntakeResponse:
    ticket_id = await ticket_store.create(request.model_dump())
    if not ticket_id:
        raise HTTPException(status_code=503, detail="ticket store unavailable")
    return IntakeResponse(ticket_id=ticket_id, status="received")
`,
    walkthrough: [
      "The schema documents limits that callers can rely on.",
      "A successful create returns 201 and the new resource identifier.",
      "A dependency failure is explicit; it is not disguised as success."
    ]
  },
  4: {
    title: "Package a repeatable, non-root service",
    language: "Dockerfile",
    description: "A container should run the same way on a laptop and in a customer environment. This example installs pinned dependencies, drops root privileges, and exposes a health check.",
    code: `FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.lock .
RUN pip install --no-cache-dir --require-hashes -r requirements.lock

RUN useradd --system --uid 10001 appuser
COPY --chown=appuser:appuser src/ ./src/
USER appuser

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "from urllib.request import urlopen; urlopen('http://127.0.0.1:8080/health', timeout=2)"
CMD ["python", "-m", "src.api"]
`,
    walkthrough: [
      "A lock file with hashes makes dependency installation repeatable.",
      "The process runs as a dedicated unprivileged user.",
      "The health check tests the running service; it does not prove business quality."
    ]
  },
  5: {
    title: "Keep observations separate from assumptions",
    language: "Python",
    description: "Discovery notes are more useful when a teammate can tell what was observed, what was inferred, and what still needs an answer. A small record type makes that distinction hard to lose.",
    code: `from dataclasses import dataclass
from typing import Literal

Kind = Literal["observation", "assumption", "question"]

@dataclass(frozen=True)
class Finding:
    kind: Kind
    statement: str
    source: str
    confidence: float

notes = [
    Finding("observation", "Agents retype the same account fields",
            "observed in 4 of 5 shadowed cases", 1.0),
    Finding("assumption", "A draft could reduce handling time",
            "team estimate; not measured", 0.4),
    Finding("question", "Can the ticket system expose account status?",
            "confirm with system owner", 0.0),
]

for note in notes:
    print(f"[{note.kind}] {note.statement} — {note.source}")
`,
    walkthrough: [
      "Every claim has a source, even when the source is a stakeholder estimate.",
      "Confidence is not truth; it tells the team what to validate next.",
      "Turn open questions into named owners and follow-up dates."
    ]
  },
  6: {
    title: "Represent the workflow before automating it",
    language: "YAML",
    description: "A compact workflow map names the actor, system, approval, and exception path for every step. It provides a shared design artifact before implementation starts.",
    code: `workflow:
  name: support-reply-draft
  trigger:
    actor: support-agent
    event: ticket.opened
  steps:
    - id: load-ticket
      system: ticketing
      owner: integration-service
    - id: retrieve-account-policy
      system: knowledge-store
      permission_check: requester_and_tenant
    - id: draft-reply
      owner: assistant
      output: proposed_text
    - id: review-and-send
      actor: support-agent
      approval_required: true
  exceptions:
    missing_policy: ask_agent_to_search
    access_denied: show_no_customer_content
    service_unavailable: leave_ticket_unchanged
`,
    walkthrough: [
      "The trigger says whose work starts the workflow.",
      "The approval boundary separates a suggestion from a consequential action.",
      "Each exception names a safe outcome rather than a vague error."
    ]
  },
  7: {
    title: "Encode the pilot boundary as policy",
    language: "Python",
    description: "A pilot is safer when its scope can be checked by code. The policy below limits the cohort and data class, and refuses to start after a stop condition is reached.",
    code: `from dataclasses import dataclass
from datetime import date

@dataclass(frozen=True)
class PilotPolicy:
    allowed_teams: frozenset[str]
    allowed_data_class: str
    stop_date: date
    max_error_rate: float

def may_process(team: str, data_class: str, today: date,
                observed_error_rate: float, policy: PilotPolicy) -> bool:
    return (
        team in policy.allowed_teams
        and data_class == policy.allowed_data_class
        and today <= policy.stop_date
        and observed_error_rate <= policy.max_error_rate
    )

policy = PilotPolicy(
    allowed_teams=frozenset({"support-east"}),
    allowed_data_class="synthetic",
    stop_date=date(2026, 11, 30),
    max_error_rate=0.05,
)
`,
    walkthrough: [
      "The allowlist is explicit and narrow; new teams are excluded by default.",
      "A stop date and error threshold give the pilot a real exit condition.",
      "A production policy also needs an owner, monitoring, and a way to disable access."
    ]
  },
  8: {
    title: "Query a trustworthy baseline",
    language: "SQL",
    description: "This query reports weekly workload and median handling time while making missing durations visible. A result is only useful when its time window, inclusion rules, and data owner are documented.",
    code: `WITH eligible AS (
    SELECT
        ticket_id,
        DATE_TRUNC('week', closed_at) AS week_start,
        EXTRACT(EPOCH FROM (closed_at - opened_at)) / 60.0 AS minutes_open
    FROM support_tickets
    WHERE closed_at >= CURRENT_DATE - INTERVAL '8 weeks'
      AND is_test = FALSE
      AND opened_at IS NOT NULL
      AND closed_at >= opened_at
)
SELECT
    week_start,
    COUNT(*) AS closed_tickets,
    ROUND(AVG(minutes_open)::numeric, 1) AS mean_minutes_open,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes_open) AS median_minutes_open
FROM eligible
GROUP BY week_start
ORDER BY week_start;
`,
    walkthrough: [
      "The CTE names the inclusion rules so reviewers can inspect them.",
      "Median is less sensitive to a few unusually old tickets than the mean.",
      "Check timezone, reopened tickets, and missing records with the data owner."
    ]
  },
  9: {
    title: "Make writes idempotent and retries bounded",
    language: "Python · httpx",
    description: "Network failures can happen after the customer system has already accepted a write. An idempotency key makes retrying safer; a retry limit prevents an outage from creating an unbounded loop.",
    code: `import asyncio
import httpx

async def upsert_ticket(client: httpx.AsyncClient, ticket: dict,
                        idempotency_key: str) -> dict:
    for attempt in range(3):
        try:
            response = await client.put(
                f"/v1/tickets/{ticket['id']}",
                json=ticket,
                headers={"Idempotency-Key": idempotency_key},
                timeout=3.0,
            )
            if response.status_code == 429 and attempt < 2:
                await asyncio.sleep(2 ** attempt)
                continue
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            if attempt == 2:
                raise
            await asyncio.sleep(2 ** attempt)
    raise RuntimeError("ticket update did not complete")
`,
    walkthrough: [
      "The same key must be reused for retries of the same logical write.",
      "Only transient conditions are retried; validation and permission errors should surface.",
      "In production, honor a bounded Retry-After value and record the final outcome."
    ]
  },
  10: {
    title: "Model user-interface states explicitly",
    language: "TypeScript",
    description: "A user should be able to tell whether a request is running, complete, or needs attention. A discriminated union makes each state and its required data explicit.",
    code: `type DraftState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; draft: string; evidenceIds: string[] }
  | { status: "error"; message: string; retryable: boolean };

function buttonLabel(state: DraftState): string {
  switch (state.status) {
    case "idle": return "Create draft";
    case "loading": return "Working…";
    case "ready": return "Review draft";
    case "error": return state.retryable ? "Try again" : "Contact support";
  }
}

function canSubmit(state: DraftState): boolean {
  return state.status === "idle"
      || (state.status === "error" && state.retryable);
}
`,
    walkthrough: [
      "The ready state carries both draft text and evidence identifiers.",
      "Loading disables duplicate submissions while the request is in flight.",
      "An error tells the interface whether retry is safe."
    ]
  },
  11: {
    title: "Route a task by constraints, not habit",
    language: "Python",
    description: "The model is a replaceable dependency behind a small interface. Route only when a language model adds value; protect sensitive work with a non-model path and make the fallback visible.",
    code: `from dataclasses import dataclass
from typing import Protocol

class TextModel(Protocol):
    async def generate(self, prompt: str, *, timeout: float) -> str: ...

@dataclass(frozen=True)
class Task:
    prompt: str
    contains_restricted_data: bool
    requires_free_text: bool

async def handle(task: Task, model: TextModel) -> str:
    if task.contains_restricted_data:
        return "Route to the approved human workflow."
    if not task.requires_free_text:
        return deterministic_lookup(task.prompt)
    try:
        return await model.generate(task.prompt, timeout=4.0)
    except TimeoutError:
        return "Draft unavailable; continue with the standard process."
`,
    walkthrough: [
      "A protocol lets tests use a fake model and production swap implementations.",
      "A deterministic task stays deterministic instead of spending tokens.",
      "Fallback text preserves the existing workflow when generation fails."
    ]
  },
  12: {
    title: "Return only evidence the user may access",
    language: "Python",
    description: "Retrieval must enforce access before context reaches the model. Keep document identifiers with each passage so the final answer can point back to the material it used.",
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Passage:
    document_id: str
    tenant_id: str
    allowed_roles: frozenset[str]
    text: str
    score: float

def select_evidence(passages: list[Passage], *, tenant_id: str,
                    role: str, minimum_score: float = 0.72) -> list[Passage]:
    return [
        item for item in passages
        if item.tenant_id == tenant_id
        and role in item.allowed_roles
        and item.score >= minimum_score
    ]

evidence = select_evidence(results, tenant_id="tenant-42", role="agent")
if not evidence:
    answer = "I could not find enough authorized evidence to answer."
else:
    context = "\n".join(item.text for item in evidence)
    citations = [item.document_id for item in evidence]
`,
    walkthrough: [
      "Tenant and role checks happen before text is assembled into model context.",
      "A score threshold is a retrieval filter, not proof that an answer is correct.",
      "Keep the selected document IDs so the UI can show citations."
    ]
  },
  13: {
    title: "Gate tool calls by schema and approval",
    language: "Python",
    description: "A model may propose an action, but ordinary application code owns authorization. This dispatcher validates arguments and pauses every write until a person approves the exact change.",
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class ProposedAction:
    name: str
    ticket_id: str
    new_priority: str

ALLOWED_PRIORITIES = {"low", "normal", "high"}

def validate(action: ProposedAction) -> None:
    if action.name != "set_ticket_priority":
        raise ValueError("tool is not allowlisted")
    if not action.ticket_id.startswith("T-"):
        raise ValueError("invalid ticket identifier")
    if action.new_priority not in ALLOWED_PRIORITIES:
        raise ValueError("invalid priority")

async def execute(action: ProposedAction, approval, ticket_api):
    validate(action)
    approved = await approval.request(
        summary=f"Set {action.ticket_id} to {action.new_priority}"
    )
    if not approved:
        return {"status": "not_applied"}
    return await ticket_api.set_priority(action.ticket_id, action.new_priority)
`,
    walkthrough: [
      "The allowlist and schema are enforced by application code, not the model.",
      "Approval names the exact target and value the user is accepting.",
      "Log the approver, timestamp, action ID, and result for later review."
    ]
  },
  14: {
    title: "Score task success and evidence separately",
    language: "Python",
    description: "A useful evaluation keeps different failure modes separate. This small harness checks whether required concepts are present and whether the answer cites the expected evidence; it does not pretend either check proves correctness.",
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Case:
    required_terms: frozenset[str]
    required_document_ids: frozenset[str]

def score(case: Case, answer: str, cited_ids: set[str]) -> dict[str, float]:
    text = answer.casefold()
    term_coverage = (
        sum(term.casefold() in text for term in case.required_terms)
        / max(1, len(case.required_terms))
    )
    citation_coverage = (
        len(case.required_document_ids & cited_ids)
        / max(1, len(case.required_document_ids))
    )
    return {
        "term_coverage": term_coverage,
        "citation_coverage": citation_coverage,
    }

assert score(case, answer, citations)["citation_coverage"] >= 0.5
`,
    walkthrough: [
      "Coverage scores are narrow signals; a reviewer still checks meaning and safety.",
      "Keep task success, citation quality, latency, and cost as separate columns.",
      "Version the cases so a prompt change can be compared against the same set."
    ]
  },
  15: {
    title: "Fail closed at the tenant boundary",
    language: "Python",
    description: "Authorization should be a server-side check on every read. Filter by tenant and the caller’s permission before returning content, and keep secrets or full customer records out of logs.",
    code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Principal:
    tenant_id: str
    user_id: str
    document_ids: frozenset[str]

def visible_documents(principal: Principal, documents: list[dict]) -> list[dict]:
    return [
        doc for doc in documents
        if doc["tenant_id"] == principal.tenant_id
        and doc["id"] in principal.document_ids
    ]

def safe_audit_record(principal: Principal, document_count: int) -> dict:
    return {
        "event": "document_search",
        "tenant_id": principal.tenant_id,
        "actor_id": principal.user_id,
        "result_count": document_count,
    }
`,
    walkthrough: [
      "Both tenant ownership and document-level permission must match.",
      "An empty permission set returns nothing; it does not fall back to broad access.",
      "Audit useful identifiers and counts while leaving document contents out."
    ]
  },
  16: {
    title: "Gate production on a staging smoke check",
    language: "YAML",
    description: "A release definition separates build, staging verification, and production promotion. The production step names an approval boundary and keeps rollback available as an explicit operation.",
    code: `release:
  build:
    steps:
      - install_from_lockfile
      - run_unit_and_contract_checks
      - build_immutable_image
  staging:
    requires: build
    steps:
      - deploy_image_by_digest
      - run_health_and_smoke_checks
      - verify_migration_compatibility
  production:
    requires: staging
    approval: release-owner
    steps:
      - confirm_customer_change_window
      - deploy_same_image_digest
      - watch_error_and_latency_gates
      - record_release_id
  rollback:
    trigger: health_gate_failed
    action: restore_previous_image_digest
`,
    walkthrough: [
      "Promote the same immutable image that passed staging.",
      "A named owner approves the production change window.",
      "The rollback target is recorded before release, not improvised afterward."
    ]
  },
  17: {
    title: "Emit useful telemetry without customer text",
    language: "Python",
    description: "Operational events need a correlation ID and measured duration, but rarely need raw prompts or customer documents. This wrapper records the health signal while preserving a privacy boundary.",
    code: `import logging
import time

logger = logging.getLogger("workflow")

async def run_draft(request_id: str, workflow, ticket_id: str):
    started = time.perf_counter()
    try:
        result = await workflow.create_draft(ticket_id)
        logger.info(
            "draft.completed",
            extra={
                "request_id": request_id,
                "ticket_id": ticket_id,
                "duration_ms": round((time.perf_counter() - started) * 1000),
                "evidence_count": len(result.evidence_ids),
            },
        )
        return result
    except Exception:
        logger.exception("draft.failed", extra={"request_id": request_id})
        raise
`,
    walkthrough: [
      "Duration and evidence count help diagnose service behavior.",
      "The log omits the prompt, generated text, and document body.",
      "Add retention, access controls, and alert ownership to the logging design."
    ]
  },
  18: {
    title: "Require a human decision before a write",
    language: "Python",
    description: "Represent review as a small state machine. The write is allowed only after an explicit approval, and expired or rejected proposals remain unapplied.",
    code: `from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import StrEnum

class Decision(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

@dataclass(frozen=True)
class Review:
    action_id: str
    decision: Decision
    expires_at: datetime

def may_apply(review: Review, now: datetime | None = None) -> bool:
    current = now or datetime.now(timezone.utc)
    return (
        review.decision is Decision.APPROVED
        and current < review.expires_at
    )

review = Review("act-104", Decision.PENDING,
                datetime.now(timezone.utc) + timedelta(minutes=10))
if may_apply(review):
    await ticket_api.apply(proposal)
else:
    await audit.record("action_not_applied", review.action_id)
`,
    walkthrough: [
      "Pending is not approval; the default state is non-execution.",
      "An approval expires so a stale proposal cannot be applied later.",
      "Bind the approval to an immutable action ID and exact action payload."
    ]
  },
  19: {
    title: "Compare outcomes without overstating causality",
    language: "Python",
    description: "A before-and-after table is descriptive evidence, not automatically proof that the software caused the change. Keep sample counts and the measurement window with the result.",
    code: `from statistics import median

def summarize(name: str, minutes_per_case: list[float]) -> dict:
    if not minutes_per_case:
        raise ValueError("at least one measured case is required")
    return {
        "period": name,
        "sample_size": len(minutes_per_case),
        "median_minutes": round(median(minutes_per_case), 1),
    }

before = summarize("baseline", [38, 42, 35, 51, 40])
pilot = summarize("pilot", [29, 34, 31, 39, 33])
change_pct = (
    (pilot["median_minutes"] - before["median_minutes"])
    / before["median_minutes"] * 100
)
print(before, pilot, f"observed change: {change_pct:.1f}%")
`,
    walkthrough: [
      "Report the sample size and median beside the percentage.",
      "Use the same case definition and timing method in both periods.",
      "Discuss seasonality, case mix, and other changes before claiming impact."
    ]
  },
  20: {
    title: "Connect the engagement with explicit stop points",
    language: "Python",
    description: "The capstone orchestration keeps authorization, evidence, drafting, approval, and measurement in separate steps. Each boundary has a safe result so a failure does not silently turn into an action.",
    code: `async def handle_case(case, principal, services):
    if not services.policy.may_start(principal, case):
        return {"status": "out_of_scope"}

    evidence = await services.search.authorized(
        query=case.question,
        principal=principal,
    )
    if not evidence:
        return {"status": "needs_human_research"}

    draft = await services.writer.create(
        question=case.question,
        evidence=evidence,
    )
    if not services.checks.has_citations(draft, evidence):
        return {"status": "draft_rejected"}

    approval = await services.review.request(draft, case.owner)
    if approval.status != "approved":
        return {"status": "not_applied"}

    result = await services.ticketing.apply(draft, approval.action_id)
    await services.metrics.record(case.id, result.status)
    return {"status": "completed", "result_id": result.id}
`,
    walkthrough: [
      "Scope, authorization, citations, and approval are independent gates.",
      "Every early return leaves a named state for the user and operations team.",
      "The capstone artifact should include tests, threat model, runbook, and measured readout."
    ]
  }
};
