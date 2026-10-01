---
title: "Introducing Moth Preview 004"
description: "A local preview that compiles your facts and definitions into a fixed field and answers classification questions with inspectable evidence."
canonical: "https://mumbrane.ai/news/introducing-moth-preview-004"
markdown: "https://mumbrane.ai/news/introducing-moth-preview-004.md"
section: "latent"
category: "Field notes"
published: "2026-09-22"
authors:
  - "Mumbrane Labs"
---

# Introducing Moth Preview 004
A local preview that compiles your facts and definitions into a fixed field and answers classification questions with inspectable evidence.

Moth is the model Mumbrane is building for field-based intelligence: your data becomes the field, and a question settles where that field supports it. Preview 004 is the first step.

## What it does

You author supported English facts, definitions and interpretation skills. Moth compiles them into a fixed, versioned field; existing local BGE assets take part in compilation. A question asks whether an entity meets a definition. Native constraint reasoning works through the requirements, and a checked response gives the result in controlled English or JSON, with its evidence.

## One example

```text
An approved supplier means a supplier who passed inspection.
A purchase qualifies as a purchase-ready item when it has funds available and its supplier is an approved supplier.
atlas is a supplier and passed inspection.
orderone appoints atlas as its supplier and has funds available.
```

Asked "Is orderone a purchase-ready item?", the field establishes the classification, though no source line states it. This explains the example's reasoning; it is not a runtime transcript.

## Scope

Asking never adds knowledge: to change the field, compile and load a new build. Preview 004 is a CLI package for macOS ARM64 and Python 3.11, with four small synthetic example worlds. It does not settle questions in a continuous field or weight facts by priority; that runtime is proposed work. See the [release evidence](https://mumbrane.ai/releases).
