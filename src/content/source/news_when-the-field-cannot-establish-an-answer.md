---
title: "When the field cannot establish an answer"
description: "Not every question finds a resting place. Missing support, conflict and incomplete execution mean different things, and the answer keeps them apart."
canonical: "https://mumbrane.ai/news/when-the-field-cannot-establish-an-answer"
markdown: "https://mumbrane.ai/news/when-the-field-cannot-establish-an-answer.md"
section: "latent"
category: "Research practice"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# When the field cannot establish an answer
Not every question finds a resting place. Missing support, conflict and incomplete execution mean different things, and the answer keeps them apart.

In a field-based system, an answer is where a question comes to rest. Sometimes the field gives it nowhere supported to rest. Saying so is part of the answer.

## One missing link

```text
ordertwo is a purchase.
birch is a supplier and passed audit.
ordertwo has funds available and appoints birch as its supplier.
```

Approval requires a passed inspection. Asked "Is ordertwo a purchase-ready item?", the documented expected outcome is `NO_SUPPORTED_PROOF`. That does not mean birch failed inspection; the field has not been given that support. This describes the example's expected result, not a captured runtime response.

## Keep the reason

Unsupported wording, conflicting facts and a resource limit are different outcomes from missing support, and each needs a different next step. Moth reports each one separately instead of collapsing them into "no".

## Improve the field on purpose

Adding an inspection fact supplies evidence; requiring an audit changes a definition. Both mean a new build. The old answer stays tied to its original build, and replay can verify it within the same runtime. It does not prove the source facts true in the outside world.
