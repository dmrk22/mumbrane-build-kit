---
title: "Release & evidence"
description: "The supported capabilities, language boundaries, and qualification evidence for Moth Inference Preview 004."
canonical: "https://mumbrane.ai/releases"
markdown: "https://mumbrane.ai/releases.md"
---

# Release & evidence
## Moth Inference Preview 004

A local CLI preview for configurable classification over compiled fields. Current profile: integrated-field/1, with four synthetic example worlds—purchasing, libraries, trails, and venues—and a separate native-demo control. The five delivered models span two profile families.

The package targets macOS ARM64 with Python 3.11 and locally available uv. Installation and usage instructions are included with the local delivery. No public download URL is provided here. This page describes the prepared local evaluation package; it does not announce a hosted service, public API, or license grant.

## What the preview supports

- Compile supported English facts, definitions, and interpretation skills into a versioned field.
- Compose positive requirements and supported relationships; classify whether an entity meets a definition.
- Construct checked English or JSON results with retained evidence.
- Edit source material, rebuild, and activate a new version.
- Query earlier activations and replay retained episodes within the same runtime.

Existing local BGE assets participate in compilation. The qualified inference and replay path does not initialize the encoder. The four example worlds are synthetic evaluation cases, not operational integrations.

## Language contract

Only declared properties, relationships, concepts, and valid aliases bind. Entity identifiers are single words. Sources use admitted complete sentences, supported positive definitions, relational conditions, and shared-subject composition. Explicit negative facts are supported; negated questions and negative definition conditions are not.

Supported question examples include:

```text
Is orderone a purchase-ready item?
Does orderone meet the requirements for a purchase-ready item?
```

English skills can teach supported interpretation and composition within the bootstrap contract. They do not establish arbitrary-English comprehension or arbitrary algorithm teaching.

Current limits include 256 entities, 2,048 facts, up to 32 documents and 128 sentences in composition, and six clauses per composed sentence. Questions have a 2,048-character limit and separate bounded parsing/execution work. These safeguards are not measured capacity guarantees. Read the delivery's `documentation/LANGUAGE-CONTRACT.md` for the complete contract.

## Outcomes and boundaries

Supported membership establishes a classification under the field's facts and definitions. `NO_SUPPORTED_PROOF` means the field does not establish membership, not that the entity fails. Conflict, language refusal, resource stop, incomplete execution, and artifact incompatibility remain distinct outcomes.

Checked execution does not prove outside-world truth. This preview is not a general chat system, arbitrary document reader, production service, or universal reasoning engine. A larger prepared base and broader procedures remain proposed work.

## Qualification

The release documentation records:

| Check | Result |
| --- | --- |
| Core installed answers | 64 |
| Historical replays of those answers | 64 |
| Expected language/resource refusals | 32 |
| Repository regression | 2,115 tests passed |
| Final sealed-artifact smoke | 10 answers and replays after fresh installation |

Offline installation, source-only updates, a new parcel domain, retained activation/replay, relocation, and integrity/refusal controls passed in the documented environment. The parcel case is additional qualification, not a sixth delivered model.

These are finite synthetic panels. Cases were examined, and new-domain work was authored by the same agent; this is not a blind generalization benchmark. Regression counts do not measure intelligence, and these results do not establish broad English accuracy, million-token capacity, or superiority over LLMs.

## Measured observations

These observations used one macOS ARM64 host, Python 3.11, local storage, and warm filesystem caches without a controlled flush. Part of qualification ran concurrently with regression work.

| Measurement | Observation |
| --- | --- |
| First core CLI query after install/load | 0.781 seconds |
| Repeated fresh CLI processes | Median 0.559 seconds across seven observations |
| Installed environment | 728,184,684 bytes |
| Compiled model payloads | 2,545,963 bytes |
| Sealed delivery archive | 180,884,002 bytes |

CLI timings include startup and surrounding work; they are not pure reasoning-kernel measurements, controlled cold-cache results, or guarantees. Guarded inference and replay recorded zero unexpected blocks across 51 instrumented processes after guard probes.

## Inspect the evidence

The complete delivery includes `qualification/report.md`, `qualification/results.json`, retained transcripts and controls. The adjacent final publication receipt binds the exact sealed archive to fresh-install smoke results. Use the release-specific `MODEL.md`, `QUICKSTART.md`, `LANGUAGE-CONTRACT.md`, and `LIMITATIONS.md` for the current interface; architecture PDFs provide broader context.

The report retains a failed harness attempt: it initially read the wrong stream for exit code 4. The runtime correctly returned RESOURCE_LIMIT; the harness was corrected without changing the runtime snapshot. Both attempts remain in the evidence.

No million-token, throughput, pricing, or production-readiness target is presented here as achieved. Compiled bundles retain source-derived evidence and may include original spans; compilation does not anonymize sensitive data.

[Explore Moth](https://mumbrane.ai/moth)
