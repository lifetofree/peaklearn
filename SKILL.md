# Agent Skills Reference

This project uses a 7-role pipeline. Each role maps to a skill you can invoke. Roles execute sequentially; each depends on the output of the previous.

---

## Pipeline Overview

```
00_PO → 01_PM → 02_TECH_LEAD → 03_ARCHITECT → 04_CODER → 05_REVIEWER → 06_DEVOPS
```

---

## Skills

### `/po` — Product Owner
**File**: `.ai.agents/00_PO_RULES.md`  
**Writes**: `docs/BUSINESS_GOALS.md`  
**Mission**: Define the "What" and the "Why." Set vision, prioritize features (must-have vs. nice-to-have), and declare success KPIs.  
**Hands off to**: PM

---

### `/pm` — Product Manager & UX Strategist
**File**: `.ai.agents/01_PM_RULES.md`  
**Reads**: `docs/BUSINESS_GOALS.md`  
**Writes**: `docs/REQUIREMENTS.md`, `docs/USER_JOURNEY.md`  
**Mission**: Translate business goals into functional requirements, UX flows, UI standards (Tailwind/Shadcn), and acceptance criteria.  
**Hands off to**: Tech Lead

---

### `/tech-lead` — Technical Lead
**File**: `.ai.agents/02_TECH_LEAD_RULES.md`  
**Reads**: `docs/REQUIREMENTS.md`  
**Writes**: `docs/TECH_STACK.md`  
**Mission**: Feasibility review, stack selection, coding conventions, branching strategy, and security baselines.  
**Hands off to**: Architect

---

### `/arch` — Architect
**File**: `.ai.agents/03_ARCHITECT_RULES.md`  
**Reads**: `docs/TECH_STACK.md`, `docs/REQUIREMENTS.md`  
**Writes**: `docs/SYSTEM_DESIGN.md`  
**Mission**: Design database schema, API contracts, component hierarchy, data flows, and design patterns. No application code.  
**Hands off to**: TDD Coder

---

### `/tdd` — TDD Engineer
**File**: `.ai.agents/04_CODER_RULES.md`  
**Reads**: `docs/SYSTEM_DESIGN.md`, `docs/TECH_STACK.md`  
**Writes**: `src/`, `tests/`  
**Mission**: Red-Green-Refactor cycle. Write failing test first, then implement, then refactor. Clean code, DRY, small functions.  
**Hands off to**: Reviewer

---

### `/review` — Reviewer / QA Auditor
**File**: `.ai.agents/05_REVIEWER_RULES.md`  
**Reads**: `src/`, `tests/`  
**Writes**: `docs/REVIEWS.md`  
**Mission**: Audit for code smells, security issues, and standards compliance. Verify tests cover acceptance criteria. No business logic changes.  
**Hands off to**: DevOps (if approved) or back to Coder (if rejected)

---

### `/devops` — DevOps Engineer
**File**: `.ai.agents/06_DEVOPS_RULES.md`  
**Writes**: `.github/`, `scripts/`, `Dockerfile`, CI/CD configs  
**Mission**: Build CI/CD pipelines, Dockerize, set up IaC, add monitoring and health checks. No src/ changes.  
**Completes**: Sets `STATUS.md` → `Production Ready`

---

## Shared Protocol

- Each role must update `STATUS.md` before handing off.
- Skills build on each other — don't skip steps.
- Existing skills in `skills/` (`/arch`, `/tdd`, `/doc`, `/grill-me`) complement this pipeline.
