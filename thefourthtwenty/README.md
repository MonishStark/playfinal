<!-- @format -->

# The Fourth Twenty – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://thefourthtwenty.ca**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                                        |
| :-------------------------------- | :------------------------------------------------- |
| `tests/pages.js`                  | Centralized list of all URLs under test            |
| `tests/visual.spec.js`            | Full-page visual regression tests                  |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability            |
| `tests/utils/stabilizePage.js`    | Freezes animations & triggers lazy-loaded sections |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots                          |
| `playwright.config.js`            | Device matrix & execution configuration            |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://thefourthtwenty.ca`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** Animations/transitions disabled, deterministic scrolling to load content, and `networkidle` settling before snapshots.

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Main Pages (2 Endpoints)

- `/` – Home
- `/about/` – About

### B. Category Pages (4 Endpoints)

- `/category/life/` – Category: Life
- `/category/politics/` – Category: Politics
- `/category/retirement/` – Category: Retirement
- `/category/other-stuff/` – Category: Other Stuff

### C. Blog Posts (5 Endpoints)

- `/of-life-and-death/` – Of Life And Death
- `/welcome-to-my-existential-crisis/` – Welcome To My Existential Crisis
- `/my-home-and-native-land/` – My Home And Native Land
- `/weekly-wtfs/` – Weekly WTFs
- `/weekly-wtf/floor-crossers/` – Weekly WTF: Floor Crossers

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Trigger:** Manual (`workflow_dispatch`)

1. Navigate to the **Actions** tab.
2. Select **The Fourth Twenty: Automation**.
3. Click **Run workflow**.
4. Download the **`thefourthtwenty-report`** from the Drive link.

---

## 6. Execution Option B: Local Setup (Developer Mode)

### Prerequisites

- **Node.js** (v14 or higher)
- **NPM**

### Step 1: Install

From the repo root:

```bash
npm install
npx playwright install
```

### Step 2: Run Tests

From the thefourthtwenty App folder:

```bash
cd thefourthtwenty
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
