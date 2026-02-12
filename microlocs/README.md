<!-- @format -->

# Microlocs – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://microlocs.com**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                                 |
| :-------------------------------- | :------------------------------------------ |
| `tests/pages.js`                  | Centralized list of all URLs under test     |
| `tests/visual.spec.js`            | Full-page visual regression tests           |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability     |
| `tests/utils/stabilizePage.js`    | Freezes animations, sliders & layout shifts |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots                   |
| `playwright.config.js`            | Device matrix & execution configuration     |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://microlocs.com`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** Animations, transitions, sticky/fixed elements, and lazy-loaded sections are stabilized before capture

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages (6 Endpoints)

- `/` – Home
- `/about/` – About
- `/blog/` – Blog
- `/training/` – Training
- `/portfolio/` – Portfolio
- `/contact-us/` – Contact Us

### B. Training Article (1 Endpoint)

- `/why-should-i-get-the-microloc-mastery-training-instead-of-sisterlocks/` – Why Microloc Training

### C. Portfolio Items (10 Endpoints)

- `/portfolio_page/art-foundation/` – Art Foundation
- `/portfolio_page/arts-groups/` – Arts Groups
- `/portfolio_page/essential-films/` – Essential Films
- `/portfolio_page/european-movement/` – European Movement
- `/portfolio_page/dada-city/` – Dada City
- `/portfolio_page/turbulent-decade/` – Turbulent Decade
- `/portfolio_page/taking-up-space/` – Taking Up Space
- `/portfolio_page/world-luminaries/` – World Luminaries
- `/portfolio_page/art-market/` – Art Market
- `/portfolio_page/nativity-scene/` – Nativity Scene

### D. Blog/Content Filters (4 Endpoints)

- `/category/uncategorized/` – Category: Uncategorized
- `/author/marshall/` – Author: Marshall
- `/tag/microloc-training/` – Tag: Microloc Training
- `/tag/microlocs/` – Tag: Microlocs

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Friday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **Microlocs: Automation**.
3. Click **Run workflow** (or wait for the scheduled run).
4. Download the **`microlocs-report`** artifact from the run.

---

## 6. Execution Option B: Local Setup (Developer Mode)

### Prerequisites

- **Node.js** (v14 or higher)
- **NPM**

### Step 1: Install

```bash
npm install
npx playwright install
```

### Step 2: Run Tests

From the Microlocs folder:

```bash
cd microlocs
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
