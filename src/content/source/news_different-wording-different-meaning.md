---
title: "Different wording. Different meaning."
description: "Nearness in an encoder's space is not meaning. How Moth keeps rewording and changed requirements apart: definitions decide."
canonical: "https://mumbrane.ai/news/different-wording-different-meaning"
markdown: "https://mumbrane.ai/news/different-wording-different-meaning.md"
section: "latent"
category: "Engineering notes"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# Different wording. Different meaning.
Nearness in an encoder's space is not meaning. How Moth keeps rewording and changed requirements apart: definitions decide.

In a field built by pretrained encoders, similar sentences land close together. That is useful, and a risk: text encoders are known to place a sentence and its negation near each other. If answers simply followed nearness, the field would blur differences that matter. So Moth keeps two jobs apart. Encoders help place what you supplied; declared vocabulary and definitions decide what counts.

## Change a phrase, keep the meaning

```text
Is orderone a purchase-ready item?
Does orderone meet the requirements for a purchase-ready item?
```

Both admitted forms refer to the same entity and concept. A source update can also teach a new supported form, such as "selects" for "appoints"; an unexplained synonym does not establish its meaning.

## Change a requirement, change the answer

Replace "passed inspection" with "passed audit" in the supplier definition and the criterion changes. The phrases are close in wording, but they are separately declared properties: one does not establish the other. After a rebuild, the classification may change.

## How to test it

Pair rewordings that should keep an answer with small edits that should change it, and review the evidence, not only the answer. See the [language contract](https://mumbrane.ai/releases#language-contract).
