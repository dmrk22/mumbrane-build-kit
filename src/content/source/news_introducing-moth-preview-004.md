---
title: "Introducing Moth Preview 004"
description: "A local preview for defining a world, compiling its meaning, and asking classification questions with inspectable evidence."
canonical: "https://mumbrane.ai/news/introducing-moth-preview-004"
markdown: "https://mumbrane.ai/news/introducing-moth-preview-004.md"
section: "latent"
category: "Field notes"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# Introducing Moth Preview 004
A local preview for defining a world, compiling its meaning, and asking classification questions with inspectable evidence.

An application that decides whether an order is ready to purchase needs a definition of readiness. The definition might require available funds and an approved supplier. Another organization might use different criteria. Before an answer can be useful, those choices need to be explicit.

Moth Preview 004 gives developers a local workflow for making that kind of decision from supplied knowledge. You author supported English facts, definitions and interpretation skills, then compile them into a field: a retained environment containing the represented knowledge and the artifacts needed to use it. Questions ask whether an entity satisfies a definition. Native reasoning works through the requirements, and a checked response presents the result in controlled English or JSON.

## Define the decision

The purchasing starter includes these definitions:

```text
An approved supplier means a supplier who passed inspection.
A purchase qualifies as a purchase-ready item when it has funds available and its supplier is an approved supplier.
```

Given declared vocabulary and the starter's interpretation skills, its facts can say:

```text
orderone is a purchase.
atlas is a supplier and passed inspection.
orderone appoints atlas as its supplier and has funds available.
```

The question is straightforward:

```text
Is orderone a purchase-ready item?
```

Under these definitions, the supplied facts establish the classification. The answer need not be written into the source for every order. It follows from the relationship to atlas, the inspection requirement and the funds attached to orderone. This is an explanation of the example's reasoning, rather than a transcript of a runtime response.

The same workflow ships with library, trail and venue examples. Each supplies a different vocabulary and set of criteria. These are small synthetic worlds for evaluating the product, not connections to operational systems.

## Compile, ask, inspect

The separation between authoring and inference matters. A source check lets you inspect interpretations and example-question bindings before building. Compilation uses existing local BGE assets to create the field. Loading a bundle creates a separate writable runtime instance; queries against the compiled field do not initialize that encoder.

When a question runs, its interpretation and result remain connected to the build that supplied their meaning. Evidence lets you inspect the definitions and facts behind the classification. A response plan constructs the English or JSON answer from the checked result. The quality of the source facts still matters: checking a derivation cannot establish whether a supplier actually passed an inspection outside the field.

Updates are deliberate. Edit the sources, compile a new bundle and load it to activate the change. Editing a text file does not change an already loaded field, and asking a question does not automatically add permanent knowledge. Earlier episodes can be replayed against their retained builds within the same Preview 004 runtime.

## The scope of this preview

Preview 004 is a CLI package for macOS ARM64 and Python 3.11. It supports classification, compositional definitions, and English-authored grammar and interpretation teaching within a documented language contract. Its skills can extend admitted wording and clause composition. They do not let users teach arbitrary reasoning algorithms in English.

The proposed Moth Base is a separate product direction: a richer prepared foundation that would supply more tested language and reusable capabilities before a user adds their world. That broader foundation is not part of this release.

For now, a useful evaluation starts with an explicit definition and a few cases whose meaning you can inspect. Read the [Moth overview](https://mumbrane.ai/moth) for the workflow and consult [releases](https://mumbrane.ai/releases) for the package and its qualification evidence.
