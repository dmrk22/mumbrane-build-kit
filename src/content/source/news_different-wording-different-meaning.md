---
title: "Different wording. Different meaning."
description: "How Moth preserves subjects, relationships and requirements when supported English is rephrased—and when a change should alter the answer."
canonical: "https://mumbrane.ai/news/different-wording-different-meaning"
markdown: "https://mumbrane.ai/news/different-wording-different-meaning.md"
section: "latent"
category: "Engineering notes"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# Different wording. Different meaning.
How Moth preserves subjects, relationships and requirements when supported English is rephrased—and when a change should alter the answer.

Two sentences can look different and ask the same question. Two almost identical sentences can ask different questions. A useful language interface has to handle both cases: recognizing equivalent wording while preserving changes that affect the answer.

In Moth Preview 004, that work starts with explicit interpretation. The field has declared vocabulary, concept definitions and compiled language artifacts. Supported wording binds to those meanings. Similarity between words is not enough to make their roles or requirements interchangeable.

## Keep the subject attached

Consider a sentence from the purchasing starter:

```text
orderone appoints atlas as its supplier and has funds available.
```

It contains a relationship and a property. The relationship runs from orderone to atlas. The available funds belong to orderone. Assigning the funds to atlas would change the supplied world even if every word survived compilation.

The starter's composition skill makes the shared subject explicit:

```text
Join clauses with "and".
Keep the first clause's subject for every following clause.
```

These lines are part of a complete skill with declared dependencies. The relationship grammar separately binds the subject, relationship and target. Together, those artifacts allow the compiler to preserve the roles across the admitted clauses and retain their connection to the original source sentence.

This is why accepting a sentence is only the beginning of an authoring check. The interpretation needs to represent the intended facts, including which entity each fact concerns.

## Change a phrase without changing the relationship

The purchasing example uses the verb “appoints.” A source update can teach the supported relationship form using “selects” and revise the facts to use it. If the subject, target and relationship bindings stay the same, the relationship represented in the field stays the same too.

That update requires supported teaching instructions. In the starter, one English skill teaches an instruction form that a later grammar skill uses. The grammar skill then defines the domain sentence pattern and its bindings. This is a concrete dependency chain; adding an unexplained synonym to the facts does not establish its meaning.

Questions can also use different admitted forms:

```text
Is orderone a purchase-ready item?
Does orderone meet the requirements for a purchase-ready item?
```

Both refer to the same entity and named concept. The pinned question language determines which forms are supported. Preview 004 also admits supported expanded descriptions of concepts, but that does not imply that every English paraphrase will be understood.

## Change a requirement and the meaning changes

Now consider the definition that gives a supplier its approved status:

```text
An approved supplier means a supplier who passed inspection.
```

Replacing “passed inspection” with “passed audit” changes the criterion. Inspection and audit are separately declared properties in this example. A fact establishing one does not automatically establish the other. After rebuilding and loading the updated field, a purchase's classification may change because the relevant requirement changed.

The distinction provides a practical evaluation method. Test supported rewordings that should preserve a classification alongside small edits that should change its interpretation. Change the supplier, the subject or the prerequisite. Review the bindings and evidence, as well as the visible answer. A system that gives the same response to every variation has not demonstrated fidelity.

Every such field update requires an explicit compile and load. Retained episodes can be replayed against their original builds within the same runtime, keeping an earlier answer connected to its earlier definitions.

A broader prepared Moth Base is proposed to provide more tested wording and composition patterns. Preview 004's present boundary is its [language contract](https://mumbrane.ai/releases#language-contract). The [Moth overview](https://mumbrane.ai/moth) explains the product and authoring workflow, and [release qualification](https://mumbrane.ai/releases#qualification) describes the current evidence.
