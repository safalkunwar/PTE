# Server concurrency and mutable-state audit

**Audit date:** 2026-08-14

The server-side review searched request handlers and shared modules for process-wide business state, in-process timers, unsafe cross-user collections, and retry-sensitive payment flows. No business data is stored in a shared mutable `Map`, `Set`, timer, or module-level array. The database client singleton is limited to connection reuse. SRS queries are user-scoped, and uploaded audio is namespaced by authenticated user ID. Cron identities are now rejected by the end-user audio-upload route.

Payment references are now protected by a database uniqueness constraint. eSewa and Khalti reference generators include cryptographic random suffixes so concurrent requests in the same millisecond do not collide. The payment webhook links a newly-created subscription back to the payment record, preventing sequential duplicate callbacks from creating another entitlement.

Subscription renewal is implemented as an idempotent HTTP callback rather than an in-process timer. It creates at most one renewal payment intent per subscription billing period using a stable `renewal-{subscriptionId}-{date}` reference, sends an existing renewal reminder when an email is available, and expires subscriptions that remain overdue for seven days. The callback authenticates as a platform cron identity and dereferences its scheduled-job registry row by the platform task UID.

The current renewal flow intentionally does not charge a stored payment method: the existing eSewa and Khalti integrations are redirect/verification flows and do not expose a safe server-side recurring-charge API in this project. The renewal intent therefore gives the user a payment record and reminder without claiming that a gateway charge has completed. A future gateway-specific recurring billing integration can advance the subscription only after a verified completed payment callback.

The admin health endpoint now uses runtime CPU, memory, process uptime, database connectivity, and payment/email configuration checks instead of fabricated random metrics. Remaining placeholder admin endpoints such as backup history and alerts are outside the current scope and should be replaced before presenting them as operational telemetry.
