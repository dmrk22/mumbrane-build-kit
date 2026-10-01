---
title: "Towards Field based Intelligence"
description: "Field-based intelligence: knowledge stored as the shape of a field, and reasoning as a question settling in it. Our hypothesis, and its limits."
canonical: "https://mumbrane.ai/research/toward-field-based-intelligence"
markdown: "https://mumbrane.ai/research/toward-field-based-intelligence.md"
section: "research"
category: "Research perspective"
published: "2026-09-16"
updated: "2026-10-01"
authors:
  - "Mumbrane Labs"
tags:
  - "Field-based intelligence"
  - "Equilibrium"
  - "Energy-based models"
---

# Towards Field based Intelligence
Field-based intelligence: knowledge stored as the shape of a field, and reasoning as a question settling in it. Our hypothesis, and its limits.

What if knowledge were not stored as rules or answers, but as the shape of a field?

That is the direction Mumbrane is pursuing. The field is produced by the data itself. Reasoning is what happens when a new input is dropped into the field and allowed to settle. The point where it comes to rest is the answer.

## The data is the field

Pretrained encoders turn each piece of information into a point in a shared space. Each point shapes the field around it, the way a charge shapes the potential around it. There is no separate model on top: the stored data is the model. Whatever you put in becomes the truth.

The charge picture is a metaphor. Fixed electric charges cannot hold a free charge in a stable resting place, so we build on smoother energy functions with real minima.

## Fix the field, then ask

Building the field is the learning step. Once it is fixed, new inputs are shaped by the field but do not change it. A question enters as a new point, and its neighbors push and pull it until the forces balance. That resting point is what the system believes. Priority inputs carry more weight, so questions near them are pulled toward them harder.

## Equilibrium is a candidate, not a guarantee

A question can come to rest between similar memories rather than on any one of them. And nearness is not meaning: text encoders are known to place a sentence and its negation close together. So a resting point must be checked against the definitions that say what counts.

## Close to known ideas

There is mathematics to borrow. **Modern Hopfield networks** store patterns as minima of an energy landscape and retrieve one by letting a query settle; transformer attention is one step of this update. **Mean shift** moves a point to the weighted average of its neighbors until it stops. **Energy-based models** choose the answer with the lowest energy. Per-item weights correspond to priority inputs.

In short: memory as a landscape, inference as rolling downhill.

## Moth as the first step

In Moth Preview 004, supported English facts and definitions compile into a fixed, versioned field, and native constraint reasoning establishes each answer with its evidence. It does not establish continuous energy optimization; the [release evidence](https://mumbrane.ai/releases) describes what exists today.

The open questions are concrete. Does a settled answer survive checking? How do accuracy and cost compare with appropriate baselines? And how far can field-based reasoning go in a physical universe, where causality limits which information can reach a decision?
