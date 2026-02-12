<!-- @format -->

# DigiBot App – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://digibotapp.com**

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

- **Base URL:** `https://digibotapp.com`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** Animations/transitions disabled, deterministic scrolling to load content, and `networkidle` settling before snapshots.

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages (8 Endpoints)

- `/` – Home
- `/about-us/` – About Us
- `/contact-us/` – Contact Us
- `/faq/` – FAQ
- `/pricing-plan/` – Pricing Plan
- `/service/` – Service
- `/terms-of-use/` – Terms of Use
- `/privacy-policy/` – Privacy Policy

### B. Solutions (7 Endpoints)

- `/fintech/` – Fintech
- `/healthcare/` – Healthcare
- `/legal/` – Legal
- `/technology/` – Technology
- `/hr/` – HR
- `/retail/` – Retail
- `/internal-virtual-agent/` – Internal Virtual Agent

### C. Blog (6 Endpoints)

- `/blog/` – Blog
- `/blog/how-to-set-up-a-chatbot/` – How To Set Up A Chatbot
- `/blog/instant-patient-data-access/` – Instant Patient Data Access
- `/blog/advantages-of-chatbots/` – Advantages Of Chatbots
- `/blog/category/technology/` – Category: Technology
- `/blog/author/ripulchhabra/` – Author: Ripul Chhabra

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Tuesday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **DigiBot: Automation**.
3. Click **Run workflow**.
4. Download the **`digibot-report`** artifact from the run.

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

From the DigiBot App folder:

```bash
cd digibotapp
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
