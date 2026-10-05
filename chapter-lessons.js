window.CURRICULUM_LESSONS = {
  1: {
    sections: [
      { title: "Start with the work, not the technology", paragraphs: [
        "A Forward Deployed Engineer (FDE) works at the boundary between a product and the conditions in which a customer must use it. That boundary includes people, existing software, data permissions, operating habits, and consequences when something fails. The job is to turn those details into a useful, dependable outcome.",
        "A request such as “add an AI assistant” is a proposed solution. First find the task underneath it: who performs it, what starts it, how often it occurs, where time or quality is lost, and what a better result would look like. Keep the first problem statement free of product names and model choices."
      ]},
      { title: "Own a delivery loop", paragraphs: [
        "Discovery makes the current process visible. Framing converts observations into a hypothesis and a boundary. A thin build tests the riskiest assumption. Deployment introduces the work to real users with safeguards. Measurement then tells the team whether to improve, expand, or stop. The loop repeats because real use reveals facts a kickoff meeting cannot.",
        "Ownership does not mean promising every requested feature. It means making tradeoffs legible, communicating risk early, and making sure a working change has an operator, a rollback path, and evidence attached to it. Escalate decisions that belong to the customer; bring them a clear choice and its consequences."
      ]},
      { title: "Write an outcome that can be checked", paragraphs: [
        "A useful outcome names a user, a behavior or result, and a measurement window. “Make support faster” is too broad. “For the billing queue, reduce median time from assignment to a reviewed first draft over the next four weeks without increasing correction rate” can be measured and debated.",
        "Separate leading signals, such as successful workflow completion, from business outcomes that take longer to move. Record the baseline and the source of each number before building. If the baseline is unknown, make learning it part of the first slice."
      ]}
    ],
    model: { title: "The field delivery loop", steps: ["Discover the real workflow", "Frame a measurable bet", "Build the smallest slice", "Deploy with a recovery path", "Prove the change and adapt"] },
    lab: ["Choose one recurring task and name the person who performs it.", "Write the trigger, current steps, handoffs, exceptions, and cost of failure.", "State one measurable improvement and how you will capture its baseline.", "List one assumption that must be checked with the user before design begins."],
    checks: [
      { q: "A stakeholder asks for a chatbot. What should you learn before choosing a model?", a: "Identify the user, task, trigger, current process, exceptions, baseline, and constraints. The chatbot is a solution idea; first verify the underlying problem." },
      { q: "What makes an FDE outcome measurable?", a: "It identifies a user or workflow, an observable result, a measurement source, and a time window." }
    ]
  },
  2: {
    sections: [
      { title: "Make boundaries explicit", paragraphs: [
        "A service is dependable when invalid inputs and temporary failures have deliberate behavior. Validate data when it crosses a boundary—an HTTP request, database row, queue message, or model response—and convert it into a type your internal code can trust. A type annotation helps readers and tools; runtime validation is still needed for untrusted values.",
        "Keep responsibilities small: parse and validate, perform one unit of work, call dependencies, then translate results into a response. Inject external dependencies so tests can replace a network service with a predictable fake. Keep configuration outside source code and fail early when required settings are missing."
      ]},
      { title: "Bound time and failure", paragraphs: [
        "Network calls can hang, so every call needs a timeout derived from the user-facing latency budget. Retries are appropriate for transient failures, not every error. Use a small retry count, exponential backoff with jitter, and an idempotency strategy before retrying writes. Otherwise a retry can duplicate the action it was supposed to recover.",
        "Async I/O helps when a process spends time waiting on many independent network operations. It does not make CPU-heavy work faster, and it does not remove the need for limits. Cap concurrent work so a burst of requests cannot exhaust sockets, memory, or a downstream service."
      ]},
      { title: "Test the behavior that matters", paragraphs: [
        "Tests should describe observable behavior: valid input succeeds, invalid input is rejected clearly, a timeout is surfaced safely, and a retry does not produce a duplicate side effect. Keep unit tests fast, then add a small number of integration tests for contracts that mocks cannot prove.",
        "A useful error tells an operator what failed and gives a caller a stable category to act on. Do not expose stack traces, credentials, or raw customer content to end users. Preserve detailed diagnostics in access-controlled logs, with correlation IDs that connect a request across services."
      ]}
    ],
    model: { title: "A dependable service boundary", steps: ["Untrusted input", "Validate and normalize", "Run bounded business logic", "Call dependencies with timeouts", "Return a typed result or safe error"] },
    lab: ["Run the example with a valid request and trace each validation step.", "Add tests for a missing field, an overlong value, a timeout, and a successful response.", "Set a timeout budget and explain why the retry count is bounded.", "Replace the mocked dependency with a small adapter interface, keeping the tests deterministic."],
    checks: [
      { q: "Why is a Python type hint not sufficient validation for an HTTP payload?", a: "Type hints describe expectations to readers and static tools, but incoming JSON is still runtime data and can be malformed. Validate it at the boundary." },
      { q: "When can retrying a request make an incident worse?", a: "When the operation has a side effect and is not idempotent, retries can repeat the write. Use an idempotency key or avoid retrying that operation." }
    ]
  },
  3: {
    sections: [
      { title: "Treat an API as an agreement", paragraphs: [
        "An API contract tells a caller what it may send, what it will receive, and how failures appear. Design the request and response before wiring clients together. Choose nouns and fields that match the workflow, define required versus optional values, and document units, time zones, and identifier formats.",
        "HTTP methods communicate intent: GET reads, POST creates or starts work, PUT replaces a resource, and PATCH changes selected fields. Status codes should be stable enough for callers to distinguish success, invalid input, missing resources, permission failures, rate limits, and server faults. A response body can add a safe machine-readable error code and a human explanation."
      ]},
      { title: "Validate and expose predictable errors", paragraphs: [
        "The server must validate independently of the client. A browser form can improve usability, but API callers may be scripts or other services. Reject unexpected shapes at the edge, use explicit response models, and avoid returning internal objects that accidentally reveal fields later added to a database table.",
        "Pagination, rate limits, and versioning are part of the contract too. Use stable cursors or page tokens for changing datasets, publish rate-limit behavior, and evolve APIs additively when possible. If a breaking change is unavoidable, give integrators a migration window and a way to test both versions."
      ]},
      { title: "Make the contract easy to use", paragraphs: [
        "A contract is useful only if another engineer can exercise it. Include an example request, a successful response, common failure responses, authentication expectations, and a local or sandbox workflow. Generated schemas can keep documentation close to code, but review the language for the humans who have to integrate it.",
        "Before connecting a production system, agree on ownership: who issues credentials, who approves scopes, who supports changes, and where incidents go. A mock server can unblock interface work, but mark any behavior it does not reproduce—especially authorization, rate limits, and partial failures."
      ]}
    ],
    model: { title: "Request contract", steps: ["Caller sends a documented request", "Server authenticates and validates", "Handler runs one use case", "Response model filters output", "Status + error code guide next action"] },
    lab: ["Read the request model and response model in the example.", "Write one valid request and one invalid request, predicting status and response shape.", "Add a missing-resource response with a stable error code.", "Document pagination and authentication assumptions for a hypothetical integrator."],
    checks: [
      { q: "Why should the server validate data even if the UI already validates it?", a: "The API can be called by clients other than that UI. Server-side validation protects the service boundary and its data." },
      { q: "What should an API error let a caller determine?", a: "Whether the call succeeded, what class of failure occurred, whether retrying is appropriate, and what safe corrective action to take." }
    ]
  },
  4: {
    sections: [
      { title: "Use Git as a delivery record", paragraphs: [
        "A repository captures how software changes over time. Small commits make review and rollback easier because each change has a clear purpose. A branch gives a focused place to work; a pull request lets another person inspect behavior, tests, and operational impact before the change reaches a shared branch.",
        "A useful commit answers “what changed?” and its accompanying notes explain why. Avoid committing secrets, local data, or generated files that do not belong in the project. Configuration examples should use harmless placeholders, while actual credentials come from an approved secret store or environment."
      ]},
      { title: "Make the runtime repeatable", paragraphs: [
        "A container image packages an application and its runtime dependencies so the service behaves consistently across machines. Pin dependencies, choose a small maintained base image, run as a non-root user, and expose only the ports the process needs. A container is packaging, not a security boundary by itself.",
        "Keep the image immutable and pass environment-specific settings at runtime. Do not bake credentials into a Dockerfile or image layer. Add a health endpoint that reports whether the app can serve work, and distinguish liveness (the process is alive) from readiness (it can accept traffic)."
      ]},
      { title: "Automate the clean path", paragraphs: [
        "A new teammate should be able to start from a clean checkout, install dependencies, run tests, and launch the service using documented steps. Continuous integration repeats the same checks on each change so quality does not depend on one person remembering a command.",
        "Keep CI feedback narrow and actionable: format, lint or type checks, tests, and a build or container smoke check. A green pipeline does not prove production readiness, but it removes avoidable variation and catches common defects before they reach a customer environment."
      ]}
    ],
    model: { title: "From change to repeatable release", steps: ["Commit a focused change", "Review diff and checks", "Build immutable image", "Configure at runtime", "Verify health and rollback"] },
    lab: ["Build the provided container and inspect its configured user and exposed port.", "Run it with an environment variable rather than hard-coding configuration.", "Write clean-checkout setup commands in a README.", "Add a CI sequence that installs, tests, and builds the service."],
    checks: [
      { q: "Why pass credentials at runtime instead of putting them in the image?", a: "Image layers can be retained, copied, or inspected. Runtime secret injection avoids baking a credential into a reusable artifact." },
      { q: "What does a green CI pipeline prove?", a: "It proves only that the configured checks passed for that change. It does not by itself establish customer fit, security, or production readiness." }
    ]
  },
  5: {
    sections: [
      { title: "Interview for observable facts", paragraphs: [
        "Discovery is a conversation about work as it happens. Ask someone who performs the task to walk through a recent example, including the boring steps, interruptions, and exceptions. “What happened next?” often uncovers the actual process better than “What do you need?” because proposed features can hide the causes of pain.",
        "Ask for frequency, volume, time, rework, consequences, and who is affected. Separate direct observations and quotes from your interpretations. If someone says a handoff is slow, ask how often it waits, what blocks it, and how the team knows it is late."
      ]},
      { title: "Make assumptions correctable", paragraphs: [
        "Keep a short assumption log with a statement, evidence, confidence, and next check. This prevents an early guess from becoming an invisible requirement. Name the person who can validate each point, especially when user behavior, policy, or data access is uncertain.",
        "Do not treat the most senior stakeholder as a proxy for every user. A sponsor can explain goals and constraints; frontline users reveal workarounds and edge cases; system owners explain permissions and support boundaries. Invite all of them into the right part of discovery."
      ]},
      { title: "Read back before you design", paragraphs: [
        "End with a concise read-back: this is the workflow we observed, these are the costly moments, these facts remain unknown, and this is one outcome worth testing. Ask the customer what you got wrong. The correction is valuable, not a failure of the interview.",
        "Agree on how the baseline will be measured and what would make a pilot worth continuing. If the team cannot measure the outcome yet, specify a low-effort instrumentation step. Do not promise a percentage improvement before you have evidence about the starting point."
      ]}
    ],
    model: { title: "Discovery evidence", steps: ["Recent real example", "Observed steps + exceptions", "Evidence and baseline", "Assumptions with owners", "Read-back and correction"] },
    lab: ["Use the example structure to record one observation and one interpretation separately.", "Draft six open questions for a 20-minute workflow interview.", "Add frequency, impact, baseline source, and confidence to an opportunity note.", "Practice a read-back that ends by inviting corrections rather than pitching a solution."],
    checks: [
      { q: "A user says “we need AI to handle this.” How do you respond?", a: "Ask them to walk through a recent instance, then learn the task, decisions, exceptions, impact, and constraints before evaluating AI as an option." },
      { q: "Why keep observations separate from assumptions?", a: "It lets the team see which conclusions are supported, challenge guesses early, and assign a concrete next check." }
    ]
  },
  6: {
    sections: [
      { title: "Draw the process people actually follow", paragraphs: [
        "A workflow map is a shared model, not decoration. Start with a trigger and an outcome, then list the actions in order. Use swimlanes for roles and systems so handoffs, waiting, and duplicated entry are visible. Keep one map focused on one workflow boundary; a huge enterprise diagram is hard to validate.",
        "Map the happy path and at least one meaningful exception. Ask what happens when information is missing, a system is down, or a reviewer disagrees. Workarounds are often the part users most need you to understand, and they may represent the highest automation risk."
      ]},
      { title: "Attach data, owners, and decisions", paragraphs: [
        "For each step, note what information it consumes, where that information originates, who can access it, and where the result goes. Mark sensitive fields and retention expectations. Trace a value from source to destination so the team can identify a system of record and resolve conflicting copies.",
        "Name the process owner, system owner, decision approver, affected user groups, and support contact. These roles may belong to different people. A stakeholder map prevents a technical design from assuming access, approval, or operational ownership that does not exist."
      ]},
      { title: "Use the map to spot intervention points", paragraphs: [
        "Look for repeated copy/paste, waits, decisions, rework, and quality checks. Repetition alone does not prove a step should be automated: some checks exist to catch high-impact mistakes. Preserve the reason for a control before proposing to remove or change it.",
        "Validate the draft with someone who performs the work. Ask them to mark missing branches and places where the map differs by customer, region, or permission level. Version the map as the workflow changes; it is an input to design, testing, and training."
      ]}
    ],
    model: { title: "A swimlane fragment", steps: ["User: receives a request", "System: looks up account context", "Reviewer: resolves exception", "System: records decision", "Owner: monitors unresolved cases"] },
    lab: ["Take one task from discovery and draw user, system, and approver lanes.", "Add a missing-data exception and identify who recovers it.", "Mark every data source, sensitive field, handoff, and wait state.", "Ask a process participant to correct the map and record what changed."],
    checks: [
      { q: "Why map exceptions instead of documenting only the happy path?", a: "Exceptions expose recovery work, controls, and edge cases that affect design and safe operations." },
      { q: "What information belongs next to a data-bearing workflow step?", a: "The data used, its source and destination, access restrictions, sensitivity, and accountable system owner." }
    ]
  },
  7: {
    sections: [
      { title: "Turn a request into a testable pilot", paragraphs: [
        "A pilot is a bounded experiment with a decision at the end. State the user group, workflow segment, allowed data, time window, success measure, and owner. Write a hypothesis in a way that could be disproved: if a draft is shown to one support team, then review time may fall while correction rate stays within an agreed limit.",
        "Choose scope to test the riskiest assumption early. If the uncertain part is data access, prove that access safely before building a polished interface. If adoption is uncertain, put a rough but usable flow in front of users. A pilot should produce learning even when the outcome is “do not expand.”"
      ]},
      { title: "Make boundaries and stop rules explicit", paragraphs: [
        "List non-goals: which user groups, records, actions, and edge cases are outside this release. Define the human fallback and what happens when confidence is low, data is stale, or an integration fails. A pilot is safer when someone can pause it without waiting for the builder.",
        "Set acceptance criteria and stop conditions before the demo. Examples include permission checks failing, a data-quality threshold being missed, or a reviewer correction rate exceeding the agreed ceiling. A stop rule is an operating decision, not a sign that the team has failed."
      ]},
      { title: "Prioritize for learning and delivery", paragraphs: [
        "Break the work into thin vertical slices that produce something a user can inspect. Prioritize by user value, feasibility, risk reduction, dependencies, and time-to-learning. Avoid a backlog full of infrastructure tasks with no clear path to a visible workflow outcome.",
        "Record dependencies such as data approval, identity setup, and system-owner availability. Give each dependency an owner and date. Revisit scope when evidence changes; do not quietly absorb a new requirement and then miss the agreed pilot decision."
      ]}
    ],
    model: { title: "Pilot boundary", steps: ["One user group", "One workflow slice", "Allowed data + actions", "Human fallback + stop rules", "Evidence → expand, revise, or stop"] },
    lab: ["Write a one-sentence hypothesis with a measurable outcome.", "Define included users, data, actions, non-goals, owner, and decision date.", "Add a human fallback and two explicit stop conditions.", "Rank the next three build tasks by what they teach, not just how easy they are."],
    checks: [
      { q: "What is a useful pilot stop condition?", a: "A condition tied to user or system risk, such as a failed permission check or an agreed quality threshold being exceeded, with a named owner and pause action." },
      { q: "Why build the riskiest assumption first?", a: "It prevents the team from investing in a polished solution before validating a constraint that could invalidate the design." }
    ]
  },
  8: {
    sections: [
      { title: "Trace claims back to owned data", paragraphs: [
        "Relational data is organized around entities and relationships. A ticket table may reference an account through a foreign key; joining them is meaningful only if the key and its lifecycle are understood. Learn the source system’s definitions before interpreting a column name as business truth.",
        "A useful query narrows data with explicit filters and a limit. Use parameterized values rather than building SQL strings from user input. Inspect counts, nulls, duplicates, and time ranges before trusting an aggregate; a clean chart can still summarize incomplete or stale records."
      ]},
      { title: "Quality includes freshness and provenance", paragraphs: [
        "Record when data was produced, when it was collected, and which system owns it. Freshness expectations depend on the task: a monthly policy document and a live ticket queue have different acceptable delays. Show timestamps or freshness status when a user could make a different decision based on recency.",
        "When sources disagree, preserve provenance and make the conflict visible. Do not silently choose the newest-looking value unless that rule is agreed and justified. Missing data is not the same as a negative result; nulls should be handled deliberately in both query logic and user-facing language."
      ]},
      { title: "Minimize and protect what you retrieve", paragraphs: [
        "Query only the columns and rows needed for the task. Apply user and tenant access before returning records, and carry source identifiers through later processing so an answer can be checked. Access-aware retrieval is a design requirement, not a filter to add after a demo.",
        "Use synthetic or public data while learning. For an approved customer dataset, confirm access, retention, and permitted use with the owner. Capture a data map with source, owner, fields, freshness, sensitivity, and known gaps; it is a practical guide for architecture and review."
      ]}
    ],
    model: { title: "From question to defensible evidence", steps: ["Clarify the question", "Select minimum fields", "Filter by access + time", "Check quality and freshness", "Return result with provenance"] },
    lab: ["Run the sample query and identify its join key and time filter.", "Add a count that exposes missing or duplicated records.", "Write a data dictionary row for each field you use: source, owner, sensitivity, freshness.", "Explain what the system should say when the source record is stale or absent."],
    checks: [
      { q: "Why preserve a source identifier alongside a retrieved fact?", a: "It lets the system and user verify provenance, apply access rules, and trace a result back to its authoritative record." },
      { q: "How should missing data be interpreted?", a: "As unknown or unavailable unless the domain explicitly defines another meaning. Do not silently convert it into a negative answer." }
    ]
  },
  9: {
    sections: [
      { title: "Choose an integration pattern for the workflow", paragraphs: [
        "Request/response APIs fit immediate reads or writes when the caller can wait for a result. Webhooks notify a receiver when something changes. Scheduled sync is simpler when seconds of freshness are unnecessary. File exchange can fit a constrained environment, but needs encryption, validation, retention, and clear ownership.",
        "Choose based on freshness, volume, network constraints, support ownership, and failure recovery. Document who owns credentials and schema changes. A technically elegant connector is not useful if the customer cannot authorize it or operate it after the pilot."
      ]},
      { title: "Protect identity and write behavior", paragraphs: [
        "Use a dedicated service identity with only the scopes required for the task. OAuth scopes, audience, token lifetime, and tenant context determine what a credential can do. Keep secrets out of logs and source control, rotate them through the approved mechanism, and test what happens when authorization is revoked.",
        "For writes, attach an idempotency key that represents one logical action. If a timeout occurs after the remote system accepted a request, a retry with the same key should not create a duplicate. Respect 429 rate-limit responses and `Retry-After`; do not turn temporary pressure into a retry storm."
      ]},
      { title: "Make sync status visible", paragraphs: [
        "A connector needs bounded timeouts, backoff, error classification, and a place for exhausted events to wait for inspection. Do not retry permanent errors such as invalid input or revoked credentials forever. Record a correlation ID and the status needed to explain what a user can do next.",
        "Track last successful sync, lag, failure count, and ownership. Explain stale data in the interface when it affects decisions. Provide a replay or repair procedure that avoids duplicate writes, and agree which team is paged when the integration stops."
      ]}
    ],
    model: { title: "Resilient connector", steps: ["Least-privilege identity", "Validate incoming event", "Idempotent bounded operation", "Classify + retry transient failure", "Expose sync state and recovery owner"] },
    lab: ["Trace the connector example’s timeout, retry, and idempotency key.", "Create a failure table for 429, timeout, revoked credential, duplicate event, and invalid request.", "For each failure, define retry policy, visible status, and owner.", "Describe a replay procedure that cannot duplicate the logical write."],
    checks: [
      { q: "Why can a timeout happen after a remote write succeeded?", a: "The receiver may commit the write while its response is lost. The caller cannot infer failure from the missing response, so retries need idempotency." },
      { q: "What is the right response to a revoked credential?", a: "Stop futile retries, surface an actionable authorization error, alert the identity owner, and resume only after approved credentials are restored." }
    ]
  },
  10: {
    sections: [
      { title: "Build a vertical slice", paragraphs: [
        "A thin slice is one complete user path across the system: an entry point, a service operation, representative data, a visible result, and a way to recover. It is more informative than building every layer in isolation because the customer can try the actual workflow and expose misunderstandings early.",
        "Use real integration points when feasible, but mock deliberately when access or setup would obscure the learning goal. Label each mock, what it represents, and what remains unproven. A demo that looks complete while hiding a mocked permission check creates false confidence."
      ]},
      { title: "Design visible interaction states", paragraphs: [
        "Every asynchronous workflow needs states the user can understand: ready, working, completed, needs review, unavailable, and failed with a next step. Do not leave the user staring at a spinner without an estimate or cancellation option. Preserve input where safe and explain whether a retry is harmless.",
        "A UI is part of the safety design. Show sources, confidence limits, permissions, and approval actions near the decision they affect. Use accessible labels and keyboard navigation; a system that only works in a live demo may fail the actual team’s environment."
      ]},
      { title: "Demo to learn, not to perform", paragraphs: [
        "A useful demo begins with the user and the current task, then shows one end-to-end path, the result, and its limitations. Ask the user to narrate what they expect before showing the next step. This reveals whether the mental model matches the interface.",
        "Capture confusion and correction as requirements evidence. Close by naming what the prototype proved, what is still a mock, what decision is needed, and who owns the next action. Update scope from observed behavior instead of defending the original design."
      ]}
    ],
    model: { title: "A demo that crosses the boundary", steps: ["User starts task", "Service retrieves approved context", "UI shows result + sources", "Human reviews or corrects", "Outcome and failure are recorded"] },
    lab: ["Use the TypeScript example to list every UI state and its trigger.", "Create a user path containing one success, one delayed result, and one recoverable error.", "Run a five-minute demo and ask the observer to narrate expected behavior.", "Record three pieces of feedback and identify which should change scope."],
    checks: [
      { q: "Why is it important to label a mocked dependency during a demo?", a: "Otherwise stakeholders may believe an unproven integration, permission, or failure behavior has been validated." },
      { q: "What should a user see when an operation needs review?", a: "A clear explanation of the pending decision, relevant evidence and limitations, and an explicit safe action to approve, edit, or decline." }
    ]
  },
  11: {
    sections: [
      { title: "Treat a language model as one component", paragraphs: [
        "A language model generates likely continuations from input and context. It can summarize, classify, draft, and transform language, but output is probabilistic: the same request can produce different wording, and plausible text can still be wrong. Build the surrounding product so correctness does not depend on confidence of tone.",
        "Tokens are the units the model processes; the context window limits how much input and output fit in one call. Long context costs latency and money and can bury relevant details. Provide the minimum task instructions and evidence needed, with clear boundaries between trusted instructions and retrieved content."
      ]},
      { title: "Choose a model with constraints in view", paragraphs: [
        "Model choice is a product decision across quality, latency, cost, data handling, availability, and operational fit. Evaluate candidate approaches on real representative tasks, including difficult cases. A larger model is not automatically better if a simple rule or query is more accurate and easier to explain.",
        "Use deterministic code for exact calculations, permissions, and business rules. Use search or SQL when the task is to find a known record. Use a language model when language flexibility adds value. A hybrid workflow often makes the boundaries clearer than asking a model to do every step."
      ]},
      { title: "Constrain output and keep a fallback", paragraphs: [
        "Structured output can reduce parsing ambiguity, but it does not guarantee that fields are truthful or semantically valid. Validate the returned schema and values before downstream use. Reject or repair malformed output through a bounded path; do not silently coerce it into an action.",
        "Set latency and cost budgets for the workflow, not just one model call. Define what users see if the provider is unavailable or the answer is unsupported. A safe fallback may be a search result, a draft for human review, or a clear “I could not complete this” state."
      ]}
    ],
    model: { title: "Route by task type", steps: ["Exact rule or calculation → code", "Known record → SQL / search", "Flexible language task → model", "Validate every output", "Fallback or human review when uncertain"] },
    lab: ["Compare the example’s routing constraints with three tasks from your workflow.", "For each task, write a deterministic baseline and a reason an LLM may help.", "Add an output validation rule and a fallback for model failure.", "Estimate per-task cost and latency using measurements from a representative sample."],
    checks: [
      { q: "When should a language model not decide a permission check?", a: "Permissions must be enforced deterministically by trusted application code using the authenticated identity and policy. Model text is not an authorization boundary." },
      { q: "Does structured JSON output ensure a correct answer?", a: "No. It can make shape validation easier, but semantic correctness and evidence still need separate checks." }
    ]
  },
  12: {
    sections: [
      { title: "Build the retrieval path before tuning prompts", paragraphs: [
        "Retrieval-augmented generation (RAG) combines search with language generation. Documents are parsed, split into passages, tagged with metadata, indexed, retrieved for a question, and passed as evidence to the model. Each stage can lose information: bad parsing, poor chunk boundaries, missing metadata, stale indexes, or weak queries.",
        "Preserve document identity, passage position, version, owner, and access labels during ingestion. Refresh and deletion behavior must be part of the design. If a source is removed or permission changes, stale copies must not remain available indefinitely in a retrieval index."
      ]},
      { title: "Retrieve evidence the user may see", paragraphs: [
        "Embeddings capture semantic similarity; keyword search can be better for exact names, identifiers, or phrases. Hybrid search uses both. Metadata filters narrow the search by tenant, permission, date, or document type. Apply access restrictions before text reaches the model, not just when rendering citations.",
        "Inspect retrieved passages directly. A confident answer cannot fix irrelevant evidence. Tune chunking and ranking against representative questions, and preserve source links and snippets so people can verify important claims. Citations should point to the actual evidence used, not just a document that happens to mention the topic."
      ]},
      { title: "Ground, cite, and abstain", paragraphs: [
        "Tell the generation step to use supplied evidence, distinguish supported facts from gaps, and return citations tied to source identifiers. Validate that each citation exists and was in the retrieved set. If no useful evidence is found, say so and offer a next step instead of filling the gap from general model knowledge.",
        "Evaluate retrieval quality separately from answer quality. A correct answer from memorized knowledge can hide a retrieval failure. Include answerable and unanswerable questions, stale documents, conflicting sources, and users with different access. Measure whether the right evidence was available and whether the final claim is supported."
      ]}
    ],
    model: { title: "RAG answer path", steps: ["Parse + version source", "Chunk + attach access metadata", "Filter and retrieve allowed evidence", "Generate grounded response + citations", "Validate support or abstain"] },
    lab: ["Trace the code’s tenant filter and source identifier from input to output.", "Create five questions answerable by a small document set and five without evidence.", "Inspect the top retrieved passages before reading the generated answer.", "Test a permission-denied user and a deleted document; record whether stale evidence leaks."],
    checks: [
      { q: "Why must authorization happen before retrieved text reaches the model?", a: "Once restricted text enters the model context, it can influence output even if the final citation or UI filter hides it." },
      { q: "What does an abstain path protect against?", a: "It prevents unsupported answers when relevant evidence is missing, weak, inaccessible, or conflicting." }
    ]
  },
  13: {
    sections: [
      { title: "Use an agent only when choices are needed", paragraphs: [
        "A fixed workflow is easier to understand when the steps are known. An agent loop is useful when a model needs to select among tools, inspect results, and decide what to do next. That flexibility adds uncertainty, latency, cost, and more possible failure paths, so keep the loop narrow.",
        "Represent each tool as a small capability with a schema, clear description, and enforced permission. Validate arguments in ordinary application code. The model may propose a tool call; the trusted service decides whether the authenticated user and current state allow it."
      ]},
      { title: "Bound actions and state", paragraphs: [
        "Separate read actions from writes. Start with read-only access and introduce a write only when a measured workflow benefit justifies it. For consequential actions, show the exact proposed change and require a human to approve it. Approval should bind to the reviewed payload so it cannot be swapped afterward.",
        "Give the loop a maximum number of steps, time budget, tool-call budget, and explicit stop conditions. Record the action, inputs, outputs, actor, approval, and result without storing unnecessary sensitive text. A loop that hits its budget should stop safely and leave a clear state for a person."
      ]},
      { title: "Recover from partial completion", paragraphs: [
        "Tool calls can time out after succeeding, return incomplete data, or fail between steps. Make writes idempotent, persist workflow state, and design a resume or compensation path. The user should be able to see whether the action was proposed, approved, attempted, completed, or needs attention.",
        "Test malformed arguments, unauthorized users, repeated calls, unavailable tools, and step-budget exhaustion. If the workflow is mostly a known sequence, replace the open-ended loop with explicit orchestration. The simplest control structure that meets the task is often the safest one."
      ]}
    ],
    model: { title: "Bounded tool loop", steps: ["Model proposes a typed call", "Policy checks identity + scope", "Human approves consequential write", "Tool executes idempotently", "Persist result or stop safely"] },
    lab: ["Inspect the example schema and identify what ordinary code validates.", "Mark each proposed tool read-only or write-capable and state its minimum scope.", "Add an approval step bound to a stable action ID and exact payload.", "Simulate a repeated call and a step-budget limit; verify neither causes an unreviewed write."],
    checks: [
      { q: "Who enforces whether a tool call is authorized?", a: "Trusted application policy using the authenticated identity and current permissions—not the model or a prompt instruction." },
      { q: "When is a fixed workflow preferable to an agent loop?", a: "When the steps and branching rules are known in advance; explicit orchestration is easier to test, explain, and operate." }
    ]
  },
  14: {
    sections: [
      { title: "Define success before changing the system", paragraphs: [
        "An evaluation set is a small, versioned collection of representative tasks with expected behavior and a scoring rubric. Build it from observed user work, then add edge cases that could cause harm: ambiguous requests, missing evidence, stale content, permission denial, and requests for actions outside scope.",
        "A rubric should distinguish task success, factual support, citation correctness, policy adherence, and usability. A single “good/bad” score hides which part failed. Keep examples and expected results reviewable so customer experts can correct them as the workflow evolves."
      ]},
      { title: "Measure quality as separate signals", paragraphs: [
        "Measure retrieval coverage, groundedness, completion rate, human correction, latency, and cost separately. Set thresholds based on workflow risk and value. For a high-impact decision, a low average error rate may still be unacceptable if the failures cluster in one user group or exception path.",
        "Automated graders can help scale review, but they can share the same blind spots as the system under test. Calibrate them against human judgments, inspect disagreements, and avoid using a model score as the only release gate. Pair metrics with examples of actual failures."
      ]},
      { title: "Prevent regressions and learn from use", paragraphs: [
        "Run offline evaluations when prompts, models, retrieval settings, or code change. Compare versions on the same cases and flag regressions. For online pilots, collect user feedback with consent and enough context to understand the outcome, while minimizing personal or sensitive data.",
        "Classify failures by cause—retrieval miss, unsupported generation, invalid action, access bug, latency, or unclear UX—and prioritize by severity and frequency. An evaluation report should end with a decision: ship, revise, narrow scope, or stop, plus who owns the follow-up."
      ]}
    ],
    model: { title: "Evaluation loop", steps: ["Representative + adversarial cases", "Run a versioned system", "Score distinct dimensions", "Review disagreements and failures", "Release decision + regression gate"] },
    lab: ["Read the example and note why task success and evidence support are separate.", "Create at least 15 cases spanning normal, ambiguous, missing-source, and permission-denied inputs.", "Score each with a written rubric and record latency and cost.", "Group the three most serious failures by cause and choose one release action."],
    checks: [
      { q: "Why keep retrieval quality separate from final answer quality?", a: "The model may answer correctly from prior knowledge while retrieval failed, or it may have good evidence but produce a poor answer. Separate measures locate the defect." },
      { q: "What makes a useful evaluation set?", a: "Representative real tasks, explicit expected behavior, meaningful edge cases, a consistent rubric, and version control." }
    ]
  },
  15: {
    sections: [
      { title: "Draw the trust boundary", paragraphs: [
        "Start a threat model with people, services, stores, and data flows. Mark where identity is checked, where sensitive content is stored, which systems cross a tenant boundary, and which components can invoke tools. This makes security questions concrete enough for a customer reviewer to answer.",
        "Classify the fields the workflow uses, minimize collection, set retention, and confirm deletion behavior. Logs, embeddings, caches, and evaluation datasets are also copies of data. Include them in the map and explain who can access each one. Use synthetic examples until an approved data path exists."
      ]},
      { title: "Enforce authorization in trusted code", paragraphs: [
        "Authentication tells you who is making a request; authorization decides what that identity may do to a specific resource. Check permissions on every relevant operation, including retrieval and background jobs. Do not rely on a hidden button or a prompt to prevent access.",
        "Tenant identifiers must come from trusted identity context, then flow through database queries, cache keys, indexes, and tool calls. Fail closed when that context is absent or invalid. Test with two tenants that have intentionally similar records so a missing filter becomes visible."
      ]},
      { title: "Assume content can be adversarial", paragraphs: [
        "Retrieved documents, emails, and user text may contain instructions that attempt to redirect the model. Treat such content as data, not authority. Keep system policy separate, limit tools, validate outputs, and require approval before a consequential write. The model should never receive credentials it does not need.",
        "Avoid logging raw prompts or outputs by default. Prefer event metadata, redacted samples, and controlled access to diagnostic payloads when necessary. Define an incident contact, retention window, and response path with the customer before the pilot expands."
      ]}
    ],
    model: { title: "Trust controls", steps: ["Authenticate the actor", "Authorize tenant + resource in code", "Minimize and filter data", "Treat retrieved text as untrusted", "Audit, retain, and delete deliberately"] },
    lab: ["Follow tenant identity through the sample retrieval code.", "Create a data-flow sketch showing storage, logs, model context, and integrations.", "Test a cross-tenant request, missing identity, injected instruction, and unauthorized tool call.", "For each test, state the expected denial, audit event, and owner."],
    checks: [
      { q: "Why must a tenant ID be derived from trusted auth context?", a: "A caller-supplied tenant value could be manipulated to request another tenant’s data. The server must bind access to verified identity and policy." },
      { q: "How should the system treat instructions found inside retrieved documents?", a: "As untrusted content that may inform the answer but cannot override system policy or grant access to tools." }
    ]
  },
  16: {
    sections: [
      { title: "Prepare the customer environment", paragraphs: [
        "A deployment plan starts with the customer’s hosting, networking, identity, data-residency, and change-control constraints. Confirm environment owners, required approvals, outbound connectivity, and how secrets are provided. Do this before selecting a platform or promising a delivery date.",
        "Separate application code from environment configuration. Store secrets in the approved secret manager, scope them to the service, and know how rotation works. Database migrations need an ordering and recovery plan, especially when old and new application versions may run at the same time."
      ]},
      { title: "Gate and stage the release", paragraphs: [
        "A release pipeline should build one artifact, run checks, deploy to a representative staging environment, and run smoke tests before promotion. Avoid rebuilding different images for each environment; promote the same immutable artifact and change only its configuration.",
        "Use a small rollout or feature flag when possible. Verify health, error rate, permission behavior, and a representative workflow before expanding exposure. Name who can authorize promotion and who is watching after release. Communicate the expected user impact and support path."
      ]},
      { title: "Practice rollback", paragraphs: [
        "Rollback is a rehearsed operation, not a vague promise. Specify the trigger, command or control, owner, data compatibility implications, and how users are informed. A database change may not be reversible, so use additive migration patterns and a forward-fix plan where necessary.",
        "After release, compare the system with its pre-release baseline. If a gate fails, stop rollout, preserve diagnostics, and decide whether to roll back or disable the feature. Record the outcome so the next deployment improves rather than repeating the same surprise."
      ]}
    ],
    model: { title: "Controlled release", steps: ["Build immutable artifact", "Deploy to staging", "Smoke test + approval gate", "Progressive production rollout", "Watch signals; roll back or continue"] },
    lab: ["Walk through the sample workflow gate and identify what blocks production promotion.", "Write prerequisites, secrets, health checks, owners, and rollback steps for your service.", "Add one smoke test that exercises an externally visible behavior.", "Rehearse a failed health check and state who stops the rollout."],
    checks: [
      { q: "Why promote the same image from staging to production?", a: "It reduces environment-specific build variation. The artifact stays the same while configuration changes for each environment." },
      { q: "Why is a rollback plan incomplete without an owner and trigger?", a: "Someone must recognize the condition and have authority to act promptly; otherwise the procedure is not operational." }
    ]
  },
  17: {
    sections: [
      { title: "Instrument questions operators need answered", paragraphs: [
        "Observability is useful when it helps answer why a user-facing outcome changed. Structured logs describe events, metrics summarize behavior over time, and traces connect a request across service boundaries. Use a correlation ID so an operator can follow one workflow without searching through unrelated customer content.",
        "Capture latency, error categories, dependency status, queue depth, retrieval coverage, and cost where relevant. Avoid logging raw prompts, secrets, or unnecessary personal information. Define the retention and access rules for telemetry just as carefully as for primary data."
      ]},
      { title: "Set service expectations", paragraphs: [
        "A service-level indicator (SLI) is a measured signal such as successful requests or latency. A service-level objective (SLO) is the target over a period. Choose indicators connected to user impact; a server can be “up” while the main workflow is unusable because a connector is stale.",
        "Alerts should be actionable and tied to an owner. Alert on symptoms users experience, then provide the first checks and safe mitigation. Avoid paging for every transient blip; noisy alerts train people to ignore important ones. Track integration freshness and quality signals alongside conventional uptime."
      ]},
      { title: "Respond and learn", paragraphs: [
        "During an incident, restore safe service first: pause a feature, fall back to manual work, or roll back. Keep a timeline of impact, actions, and decisions. Customer updates should state what is affected, what users should do, and when the next update will arrive.",
        "A blameless review asks how the system and process allowed the failure, not who to fault. Record contributing conditions, detection gaps, and concrete owners for follow-up. Add a regression case or runbook improvement so the same failure is easier to detect and recover from."
      ]}
    ],
    model: { title: "Signal to recovery", steps: ["User-impact signal fires", "Correlate request + dependency", "Triage with owner and runbook", "Apply safe mitigation", "Review cause and improve guard"] },
    lab: ["Inspect the telemetry example and identify which user question each field can answer.", "Sketch a dashboard with success, latency, errors, freshness, and cost.", "Write an alert row with symptom, threshold, owner, first check, and mitigation.", "Draft the first three steps of an incident runbook for a failed dependency."],
    checks: [
      { q: "Why should logs avoid raw customer text by default?", a: "Raw content increases privacy and breach impact. Operational metadata and controlled, minimized diagnostics usually answer many support questions." },
      { q: "What is the difference between an SLI and an SLO?", a: "An SLI is the measured signal; an SLO is the target set for that signal over a defined period." }
    ]
  },
  18: {
    sections: [
      { title: "Make adoption part of the system", paragraphs: [
        "A pilot succeeds only if people can use it in the context of their work. Identify when the feature appears, what training is needed, and who supports questions. Co-design with representative users and observe actual use rather than assuming that a positive demo equals adoption.",
        "A human handoff is an explicit workflow state. The person receiving it needs the request, relevant evidence, what the system already tried, and the decision required. Do not hand over a vague alert with no context or silently make the human responsible for checking every output."
      ]},
      { title: "Design the review moment", paragraphs: [
        "Show a reviewer the proposed action, supporting information, uncertainties, and available choices. Make approve, edit, reject, and defer distinct. Record who decided and what changed when that matters for auditability, but collect only the information needed to support the workflow.",
        "Human review is not a magic safety control. Reviewers need time, authority, understandable evidence, and a realistic workload. Measure review time, override rate, correction types, and queue buildup. If review becomes rubber-stamping, revisit the design and the incentive around the step."
      ]},
      { title: "Train, support, and improve", paragraphs: [
        "Teach the task and limits, not a list of button clicks alone. Provide a concise guide, realistic examples, and a support contact. Explain what the system does with data and what users should do when an answer looks wrong or a source is missing.",
        "Collect feedback through a clear channel and close the loop by telling users what changed. Watch for workarounds, abandoned flows, and unequal impact across roles. Adoption signals help determine whether to expand, retrain, redesign, or stop a pilot."
      ]}
    ],
    model: { title: "Human-centered workflow", steps: ["System prepares a bounded suggestion", "Reviewer sees evidence + uncertainty", "Person approves, edits, rejects, or defers", "Decision is recorded appropriately", "Feedback improves the next iteration"] },
    lab: ["Trace the sample approval state from proposal through human decision.", "Sketch a review screen that shows evidence, uncertainty, and four distinct choices.", "Name the reviewer’s authority, expected workload, and escalation path.", "Define two adoption measures and one signal that review has become a rubber stamp."],
    checks: [
      { q: "What must be true for human review to reduce risk?", a: "The reviewer needs time, authority to change the result, understandable evidence, and a practical way to reject or escalate." },
      { q: "Why measure review workload?", a: "An overloaded queue can delay work or turn careful oversight into automatic approval, undermining the intended safeguard." }
    ]
  },
  19: {
    sections: [
      { title: "Compare outcomes with a credible baseline", paragraphs: [
        "A before-and-after comparison is useful, but it does not automatically prove the system caused the change. Work volume, staffing, seasonality, policy, and case mix may also have shifted. Record the baseline period, population, metric definition, and data source before making a claim.",
        "Choose measures that describe the actual workflow: time to first useful response, correction rate, completion rate, escalation quality, or user effort. Pair efficiency measures with quality and safety guardrails. Faster output is not valuable if it creates more rework or shifts hidden effort to another team."
      ]},
      { title: "Use the right strength of claim", paragraphs: [
        "If the pilot has a comparison group or phased rollout, explain how groups were chosen and what may differ. If it is a simple pre/post observation, say that the result is an association observed during the pilot, not a causal estimate. Be transparent about sample size and missing data.",
        "Report distributions and exceptions, not only averages. A median can hide a long tail; a mean can be distorted by outliers. Segment results by relevant user or task type only when sample sizes and privacy allow. Explain uncertainty in plain language."
      ]},
      { title: "Tell the delivery story", paragraphs: [
        "A useful readout connects the original problem, what was built, who used it, what evidence changed, what limitations remain, and the decision requested. Show a real workflow artifact, not only architecture. Include failures and learning; they help stakeholders judge the next investment.",
        "End with a specific recommendation: expand under stated conditions, run another test, narrow scope, or retire the feature. Name the operational owner and next review date. A handoff that ends with a decision and a responsible person is more useful than a polished deck without a next step."
      ]}
    ],
    model: { title: "Evidence-led readout", steps: ["Define baseline + cohort", "Measure outcome + guardrails", "Inspect spread and exceptions", "State limitations honestly", "Recommend the next decision"] },
    lab: ["Review the example and identify its baseline, comparison, and causal caveat.", "Choose one workflow outcome and two guardrails for your pilot.", "Create a small before/after table with sample size, period, source, and limitations.", "Write a three-sentence readout that includes the result, uncertainty, and requested decision."],
    checks: [
      { q: "Can a simple before/after change prove the tool caused the improvement?", a: "Usually not by itself. Other changes may explain the difference, so describe it as an observed association unless the evaluation design supports a stronger causal claim." },
      { q: "Why pair speed with a quality guardrail?", a: "A faster workflow can shift costs into corrections, errors, escalations, or downstream work. The guardrail checks that the improvement remains useful." }
    ]
  },
  20: {
    sections: [
      { title: "Run a complete engagement", paragraphs: [
        "The capstone follows one simulated or authorized workflow from first conversation to operational handoff. Choose a problem with a real user, a recurring task, and an observable cost. Keep practice data synthetic unless you have explicit permission and an approved environment for real information.",
        "Begin with discovery notes and a workflow map. Separate facts from assumptions, identify decision owners and systems, then write an outcome hypothesis and baseline plan. Do not start with a model. Decide whether rules, SQL, search, or a language model best fits each part of the task."
      ]},
      { title: "Build a narrow system with explicit controls", paragraphs: [
        "Write a pilot charter with users, included data, actions, non-goals, dependencies, success measures, stop conditions, and the decision date. Draw the trust boundary. Define identity, retrieval filters, retention, and audit expectations before connecting sensitive sources.",
        "Build a complete vertical slice: one user entry point, one service path, a representative integration, a useful result, and a safe failure path. Include an evaluation set and test normal, ambiguous, unavailable, unauthorized, and adversarial cases. Keep consequential writes behind an approval that binds to the exact action."
      ]},
      { title: "Deploy, learn, and leave it operable", paragraphs: [
        "Prepare a staging environment, smoke test, rollout gate, monitoring view, and rollback procedure. Verify who owns credentials, alerts, incidents, and user support. Run a demo with users and make changes based on observed behavior rather than defending an early prototype.",
        "At the end, compare outcomes to the baseline and state the limits of the evidence. Deliver a runbook, decision record, evaluation results, known gaps, and a recommendation to expand, revise, or stop. The engagement is complete when the customer can make the next decision and operate the result without relying on your memory."
      ]}
    ],
    model: { title: "Capstone delivery thread", steps: ["Discover + map", "Charter + threat model", "Build + evaluate", "Deploy + observe", "Prove + hand off"] },
    lab: ["Create a capstone folder with discovery brief, workflow map, pilot charter, and threat model.", "Implement one end-to-end slice using a representative dataset and the chapter examples as patterns.", "Write evaluation cases, a deployment/runbook plan, and a before/after measurement plan.", "Present a 10-minute demo and a one-page decision memo that includes limitations, owners, and a next step."],
    checks: [
      { q: "What evidence should exist before you recommend expanding the capstone pilot?", a: "A defined baseline, representative task results, quality and safety guardrails, user feedback, operational signals, and an honest account of limitations." },
      { q: "What makes a handoff complete?", a: "A named owner can operate, monitor, recover, and support the system using the runbook and access they have, and stakeholders know the next decision." }
    ]
  }
};
