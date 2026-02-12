<!-- @format -->

# Microloc Directory – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://microlocdirectory.com**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                             |
| :-------------------------------- | :-------------------------------------- |
| `tests/pages.js`                  | Centralized list of all URLs under test |
| `tests/visual.spec.js`            | Full-page visual regression tests       |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability |
| `tests/utils/stabilizePage.js`    | Freezes animations & layout shifts      |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots               |
| `playwright.config.js`            | Device matrix & execution configuration |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://microlocdirectory.com`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** Animations, transitions, sticky/fixed elements, and lazy-loaded sections are stabilized before capture

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages (2 Endpoints)

- `/` – Home
- `/explore/` – Explore

### B. Categories (2 Endpoints)

- `/listing-category/stylist/` – Stylist
- `/listing-category/salons/` – Salons

### C. Listings (14 Endpoints)

- `/listing/dianefabulous-5/` – DianeFabulous
- `/listing/tiana-k-hair-designs/` – Tiana K Hair Designs
- `/listing/treasured-locs-and-tips/` – Treasured Locs And Tips
- `/listing/cortne-gemes/` – Cortne Gemes
- `/listing/locd-with-love-by-adasha-2/` – Locd With Love By Adasha
- `/listing/virtuous-crowns/` – Virtuous Crowns
- `/listing/classy-cees-salon-2/` – Classy Cees Salon
- `/listing/microloc-mastery/` – Microloc Mastery
- `/listing/linda-nguyen/` – Linda Nguyen
- `/listing/loven-hair-studio-4/` – Loven Hair Studio
- `/listing/pretty-girl-locd/` – Pretty Girl Locd
- `/listing/dechelle-marchetti/` – Dechelle Marchetti
- `/listing/jeannine-h/` – Jeannine H
- `/listing/tammy-t/` – Tammy T

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Friday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **Microloc Directory: Automation**.
3. Click **Run workflow** (or wait for the scheduled run).
4. Download the **`microlocsdirectory-report`** artifact from the run.

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

From the Microloc Directory folder:

```bash
cd microlocsdirectory
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
