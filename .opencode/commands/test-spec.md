---
description: Write and execute tests for a Home Food feature specification.

argument-hint: "Spec file name (Example: 04-registration)"

allowed-tools: Read, Write, Glob, Bash, Grep
---

Run the complete testing pipeline for the feature specified in `$ARGUMENTS`.

The testing pipeline consists of:

1. Reading the specification.
2. Determining the target project.
3. Generating tests from the specification.
4. Executing only the generated tests.
5. Producing a consolidated report.

Always follow the conventions defined in `AGENT.md`.

---

# Validation

If no argument is provided, stop immediately and respond:

> Please provide a specification name.

Example:

```text
/test-spec 04-registration
```

---

If the specification file does not exist at:

```text
.opencode/specs/$ARGUMENTS.md
```

Stop immediately and respond:

> Spec file not found at `.opencode/specs/$ARGUMENTS.md`. Please verify the specification name and try again.

---

# Step 1 — Read the Specification

Read:

```text
.opencode/specs/$ARGUMENTS.md
```

Determine:

- Feature title
- Feature type
- User roles
- Navigation
- Screens
- Backend modules
- API endpoints
- Validation rules
- Business rules

---

# Step 2 — Determine the Target Project

Determine which application the specification belongs to.

Possible values:

## Frontend

```text
homeFood/
```

Typical features:

- Expo screens
- Components
- Navigation
- Forms
- Buyer experience
- Seller experience
- Redux
- RTK Query

---

## Backend

```text
homeFoodBackend/
```

Typical features:

- Express routes
- Controllers
- Services
- Repository
- Models
- Validation
- Authentication

---

## Full Stack

If the specification contains both frontend and backend work:

Generate and execute tests for both applications.

---

Set:

```text
PROJECT_DIR
PROJECT_TYPE
```

---

# Step 3 — Generate Tests

Invoke the **test-writer** subagent.

Provide:

- Specification

```text
.opencode/specs/$ARGUMENTS.md
```

- Project Type

```text
Frontend
Backend
Full Stack
```

- Project directory

```text
homeFood/
```

or

```text
homeFoodBackend/
```

Use the specification as the only source of truth.

Do **not** derive expected behaviour from the implementation.

Generate tests covering:

- Functional requirements
- Validation
- Business rules
- Permissions
- Authentication
- Authorization
- Loading states
- Empty states
- Error states
- Success paths
- Edge cases

---

## Frontend Test Locations

Create tests alongside the relevant source files.

Examples:

```text
app/**/*
components/**/*
features/**/*
```

Typical naming:

```text
Component.test.tsx
Screen.test.tsx
hook.test.ts
```

---

## Backend Test Locations

Examples:

```text
src/modules/**/*
```

or

```text
__tests__/
```

Typical naming:

```text
foods.test.ts
orders.test.ts
auth.test.ts
```

---

Wait until the **test-writer** confirms that every test file has been successfully created.

If test generation fails, stop immediately and report the reason.

Do not continue.

---

# Step 4 — Execute Tests

After successful test generation, invoke the **test-feature** subagent.

Provide:

- Project directory
- Project type
- Specification
- List of generated test files

Run only the generated tests.

Preferred command:

```bash
npx vitest run
```

If supported, execute only the generated files rather than the entire suite.

---

# Step 5 — Analyze Results

The **test-feature** agent should:

- Execute the tests
- Analyze failures
- Identify likely root causes
- Cross-reference the specification
- Determine whether failures are caused by:
  - Bugs
  - Missing implementation
  - Incorrect tests
  - Environment/configuration issues

Do not modify source code or test files.

---

# Handoff Rules

Do not execute Step 4 until Step 3 has completed successfully.

Do not:

- Fix source code
- Modify implementation
- Rewrite tests
- Install dependencies

If the test-writing phase fails, terminate the workflow immediately.

---

# Final Output

Produce a consolidated report using the following format.

# Testing Pipeline Report — $ARGUMENTS

## Specification

- Feature
- Project
- Feature Type

---

## Step 1 — Tests Generated

List every generated test file.

For each file include:

- File path
- Short description
- Specification requirements covered

---

## Step 2 — Test Execution

Include:

- Total tests
- Passed
- Failed
- Skipped
- Duration

---

## Failed Tests

For every failure include:

- Test name
- File
- Error summary
- Likely cause

Classify each failure as one of:

- Missing implementation
- Implementation bug
- Validation issue
- Permission issue
- Incorrect configuration
- Test issue

---

## Coverage Summary

Summarize whether the generated tests cover:

- Functional requirements
- Validation
- Authentication
- Authorization
- Loading states
- Empty states
- Error handling
- Edge cases

Highlight any uncovered requirements.

---

## Recommendations

Provide prioritized recommendations.

### High Priority

Critical issues preventing the feature from working.

### Medium Priority

Recommended improvements.

### Low Priority

Minor enhancements.

---

## Verdict

Choose exactly one:

- ✅ Ready for code review — all generated tests pass.
- ⚠️ Ready with warnings — tests pass but improvements are recommended.
- ❌ Needs implementation fixes — one or more generated tests failed.

Do not modify any project files during this workflow.