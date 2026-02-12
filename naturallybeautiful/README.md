<!-- @format -->

# Naturally Beautiful – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://naturallybeautifulhaircare.com**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                                          |
| :-------------------------------- | :--------------------------------------------------- |
| `tests/pages.js`                  | Centralized list of all URLs under test              |
| `tests/visual.spec.js`            | Full-page visual regression tests                    |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability              |
| `tests/utils/stabilizePage.js`    | Freezes animations, popups, parallax & layout shifts |
| `tests/utils/lockHeroSlide.js`    | Locks homepage hero slider to first slide            |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots                            |
| `playwright.config.js`            | Device matrix & execution configuration              |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://naturallybeautifulhaircare.com`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.06`
- **Stabilization:** Animations, sliders, popups, and parallax effects are frozen before capture

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages & Shop (4 Endpoints)

- `/` – Home
- `/about-us/` – About Us
- `/shop/` – Shop
- `/contact-us/` – Contact Us

### B. Product Categories (4 Endpoints)

- `/product-category/essential-oils/` – Essential Oils
- `/product-category/hair-care/` – Hair Care
- `/product-category/hair-growth/` – Hair Growth
- `/product-category/hair-tools/` – Hair Tools

### C. Product Detail Pages (5 Endpoints)

- `/product/scalp-stimulating-hair-growth-formula/` – Scalp Stimulating Formula
- `/product/hot-oil-treatment-gift-set/` – Hot Oil Gift Set
- `/product/10-key-tips-for-magnificent-microlocs/` – Microlocs Tips
- `/product/online-microtraing-certificate-course/` – Microtraining Course
- `/product/sweet-treat-pamper-kit/` – Sweet Treat Pamper Kit

### D. Portfolio Gallery Items (15 Endpoints)

- `/portfolio-item/layers/` – Layers
- `/portfolio-item/volume/` – Volume
- `/portfolio-item/confident/` – Confident
- `/portfolio-item/elegant/` – Elegant
- `/portfolio-item/beautiful/` – Beautiful
- `/portfolio-item/bob/` – Bob
- `/portfolio-item/shades/` – Shades
- `/portfolio-item/sombre/` – Sombre
- `/portfolio-item/tail/` – Tail
- `/portfolio-item/braids/` – Braids
- `/portfolio-item/keratin/` – Keratin
- `/portfolio-item/curls/` – Curls
- `/portfolio-item/pixie/` – Pixie
- `/portfolio-item/waves/` – Waves
- `/portfolio-item/colors/` – Colors

### E. Portfolio Tags (7 Endpoints)

- `/portfolio-tag/blonde/` – Blonde
- `/portfolio-tag/gloss/` – Gloss
- `/portfolio-tag/haircut/` – Haircut
- `/portfolio-tag/colors/` – Colors
- `/portfolio-tag/hairstyle/` – Hairstyle
- `/portfolio-tag/trends/` – Trends
- `/portfolio-tag/highlights/` – Highlights

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Wednesday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **Naturally Beautiful: Automation**.
3. Click **Run workflow** (or wait for the scheduled run).
4. Download the **`naturallybeautiful-report`** artifact from the run.

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

From the Naturally Beautiful folder:

```bash
cd naturallybeautiful
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
