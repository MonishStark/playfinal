<!-- @format -->

# Inventor Market – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://www.inventor.market**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                                      |
| :-------------------------------- | :----------------------------------------------- |
| `tests/pages.js`                  | Centralized list of all URLs under test          |
| `tests/visual.spec.js`            | Full-page visual regression tests                |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability          |
| `tests/utils/stabilizePage.js`    | Freezes animations, parallax & layout shifts     |
| `tests/utils/stitchImages.js`     | Utility for stitching images (reporting support) |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots                        |
| `playwright.config.js`            | Device matrix & execution configuration          |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://www.inventor.market`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** Animations, lazy-load triggers, and parallax effects are stabilized before capture

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages (7 Endpoints)

- `/` – Home
- `/about-us/` – About Us
- `/contact-us/` – Contact Us
- `/privacy-policy/` – Privacy Policy
- `/add-listing/` – Add Listing
- `/patent-services/` – Patent Services
- `/iump-subscription-plan/` – Subscription Plans

### B. Categories (1 Endpoints)

- `/category/aviation/` – Aviation

### C. Explore (1 Endpoint)

- `/explore/` – Explore

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Thursday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **Inventor Market: Automation**.
3. Click **Run workflow**.
4. Download the **`inventormarket-report`** artifact from the run.

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

From the Inventormarket folder:

```bash
cd inventormarket
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
