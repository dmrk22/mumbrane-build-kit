---
title: "When the field cannot establish an answer"
description: "Missing support, conflicting information and incomplete execution mean different things. A useful answer keeps those distinctions visible."
canonical: "https://mumbrane.ai/news/when-the-field-cannot-establish-an-answer"
markdown: "https://mumbrane.ai/news/when-the-field-cannot-establish-an-answer.md"
section: "latent"
category: "Research practice"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# When the field cannot establish an answer
Missing support, conflicting information and incomplete execution mean different things. A useful answer keeps those distinctions visible.

Suppose a purchasing rule requires an approved supplier, and approval requires a passed inspection. The field says that a supplier passed an audit. Is that enough to approve the purchase?

Under those definitions, it is not enough to establish approval. It also does not establish that the supplier failed an inspection. The difference matters to anyone using the answer to decide what to check next.

Moth Preview 004 keeps missing support distinct from a negative conclusion. Its field is the compiled environment of supplied facts, definitions and supported interpretation artifacts. That boundary specifies what the runtime may use to establish an answer. It does not turn everything outside the field into a false statement.

## An example with one missing link

The purchasing starter defines its requirements this way:

```text
An approved supplier means a supplier who passed inspection.
A purchase qualifies as a purchase-ready item when it has funds available and its supplier is an approved supplier.
```

For a second order, the supplied facts include:

```text
ordertwo is a purchase.
birch is a supplier and passed audit.
ordertwo has funds available and appoints birch as its supplier.
```

The question is:

```text
Is ordertwo a purchase-ready item?
```

The documented expected outcome is `NO_SUPPORTED_PROOF`: the compiled field does not establish membership in the purchase-ready category. Funding is present, and the supplier relationship is present. What is absent is support for the inspection requirement attached to birch.

This describes the example's expected result, not a captured runtime response. It would be incorrect to paraphrase it as “birch failed inspection” or “ordertwo is definitely unready.” An inspection record may exist elsewhere. The field has not been given that support.

## Preserve the reason work stopped

Missing support is only one possible outcome. Unsupported vocabulary or syntax can prevent a question from receiving an admitted interpretation. Ambiguity can leave incompatible interpretations. Relevant represented information can conflict. Execution can reach a resource limit or finish without establishing a completed result.

Those situations call for different responses. A language diagnostic directs attention to the question or source wording. A conflict directs attention to the represented information. A resource stop says that a limit was reached; it does not prove that no answer exists. Treating all of them as an ordinary “no” would conceal information that an application needs.

Preview 004 presents results through controlled English or JSON. The response is constructed from the checked result, while the retained record connects the interpretation and execution to their build and evidence. Applications evaluating this workflow should inspect those outcome distinctions before deciding how to act. A human review step may need the reason for missing support as much as the classification itself.

## Improve the field deliberately

An author might obtain a valid inspection fact and add it to the source. Alternatively, the organization might decide that its policy should require an audit instead. Those are different updates: one supplies evidence under an existing definition; the other changes the definition.

Both require compiling a new bundle and loading it before subsequent questions use the change. The old answer remains associated with its original build. Within the same Preview 004 runtime, replay can verify that retained interpretation and execution chain. It does not prove that the source facts were true in the outside world, or turn an earlier answer into an answer under the new policy.

The proposed richer Moth Base would expand tested capabilities, but a larger foundation would still need clear outcome boundaries. Evidence is useful when it shows both what follows and what has not been established.

Read the [Moth overview](https://mumbrane.ai/moth) for the current model and local workflow, and consult the [language contract](https://mumbrane.ai/releases#language-contract) and [qualification evidence](https://mumbrane.ai/releases#qualification) for the release's supported outcomes.
