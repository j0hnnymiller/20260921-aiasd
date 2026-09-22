---
ai_generated: true
model: "github/copilot@2026-09-21"
operator: "johnmillerATcodemag-com"
chat_id: "create-html5-instructions-20260921"
prompt: |
  create an instruction file for HTML5
started: "2026-09-21T00:00:00Z"
ended: "2026-09-21T00:00:00Z"
task_durations:
  - task: "instruction file creation"
    duration: "00:05:00"
total_duration: "00:05:00"
ai_log: "ai-logs/2026/09/21/create-html5-instructions-20260921/conversation.md"
source: "user request"
name: html5
description: HTML5 markup, accessibility, and document structure guidelines
applyTo: "**/*.html"
version: "1.0.0"
author: "johnmillerATcodemag-com"
tags: ["html5", "accessibility", "web-standards"]
owner: "Development Team"
reviewedDate: "2026-09-21"
nextReview: "2026-12-21"
---

# HTML5 Coding Instructions

## Overview

Use these instructions when creating or modifying HTML5 documents. Produce semantic, accessible, valid, and maintainable markup that works across supported browsers and viewport sizes.

## Document Structure

- Begin documents with `<!doctype html>` and set `<html lang="...">` to the document language.
- Include UTF-8 encoding and a responsive viewport in `<head>`.
- Use one descriptive `<title>` per page.
- Organize content with semantic elements such as `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>` when they represent the content structure.
- Maintain a logical heading hierarchy. Use one `<h1>` for the page or primary view, followed by ordered heading levels.
- Keep structure in HTML, presentation in CSS, and behavior in JavaScript.

## Accessibility

- Associate every form control with a visible `<label>` or an appropriate accessible name.
- Use native controls such as `<button>`, `<a>`, `<input>`, and `<select>` instead of clickable `<div>` elements.
- Provide meaningful `alt` text for informative images; use `alt=""` for decorative images.
- Use link text and button labels that describe their action or destination.
- Preserve keyboard navigation and visible focus states.
- Add ARIA only when native HTML semantics do not provide the required behavior.
- Keep dynamic status and error messages available to assistive technologies.

## Forms and Data

- Set an explicit `type` on every `<button>` inside a form.
- Use appropriate input types, `name` values, autocomplete hints, and native validation attributes.
- Use `fieldset` and `legend` for related groups of controls.
- Associate validation messages with their controls using `aria-describedby` when needed.
- Do not treat client-side validation as a substitute for server-side validation.

## Links, Media, and Resources

- Use `<a href="...">` for navigation and `<button>` for actions.
- Provide captions or transcripts for video and audio when required by the content.
- Set explicit dimensions or stable aspect ratios for media to reduce layout shifts.
- Load scripts with `defer` when they do not need to block document parsing.
- Use secure, intentional resource URLs and avoid inline event handlers.

## Security and Maintainability

- Do not place secrets, tokens, or sensitive data in HTML.
- Avoid injecting unsanitized user content into the document.
- Use descriptive, stable `id` and `class` values that match the application domain.
- Preserve existing IDs, form names, data attributes, and accessible names unless a coordinated change requires them.
- Keep comments short and explain only non-obvious structural decisions.

## Validation Checklist

- [ ] The document has a doctype, language, charset, viewport, and descriptive title.
- [ ] Headings and landmarks form a logical structure.
- [ ] Forms have labels, appropriate control types, and useful validation messages.
- [ ] Interactive elements are keyboard accessible and use native semantics.
- [ ] Images and media have appropriate alternatives.
- [ ] No secrets or unsanitized user content are embedded.
- [ ] Referenced stylesheets, scripts, links, and IDs resolve correctly.
- [ ] The page is checked at desktop and mobile viewport sizes.

## Summary

Write semantic HTML5 first, make accessibility part of the markup, keep behavior and presentation separate, and validate structure, resources, and responsive behavior before completing the change.

---

**Document Version**: 1.0.0
**Last Updated**: 2026-09-21
**Maintainer**: Development Team
**Related Instructions**: `instruction-files.instructions.md`, `ai-assisted-output.instructions.md`
