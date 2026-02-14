<!-- @format -->

# Techwink – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://techwink.net**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                     | Description                                                   |
| :-------------------------------- | :------------------------------------------------------------ |
| `tests/pages.js`                  | Centralized list of all URLs under test                       |
| `tests/visual.spec.js`            | Full-page visual regression tests                             |
| `tests/smoke.spec.js`             | Smoke tests to verify page availability                       |
| `tests/utils/safeGoto.js`         | Navigation helper with retry for transient network drops      |
| `tests/utils/stabilizePage.js`    | Freezes animations, forces eager images, controlled scrolling |
| `tests/visual.spec.js-snapshots/` | Baseline visual snapshots                                     |
| `playwright.config.js`            | Device matrix & execution configuration                       |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://techwink.net`
- **Execution Mode:** Sequential
- **Visual Tolerance:** `maxDiffPixelRatio: 0.03` (visual suite default)
- **Stabilization:** Animations/transitions disabled, images forced eager-load, and pages are scrolled safely to trigger lazy content (some pages skip scrolling for stability).

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Core Pages (12 Endpoints)

- `/` – Home
- `/about/` – About
- `/services/` – Services
- `/clients/` – Clients
- `/partners/` – Partners
- `/blog/` – Blog
- `/careers/` – Careers
- `/contact/` – Contact
- `/press/` – Press
- `/privacy-policy/` – Privacy Policy
- `/legal/` – Legal
- `/web-stories/` – Web Stories

### B. Services (19 Endpoints)

- `/services/artificial-intelligence-development-services/` – AI Development
- `/services/chatgpt-integration-services/` – ChatGPT
- `/services/nft-marketplace-development/` – NFT
- `/services/api-integration/` – API
- `/services/mobile-application-development-services/` – Mobile Apps
- `/services/mvp-development-services/` – MVP
- `/services/web-development/` – Web Dev
- `/services/web-design-services/` – Web Design
- `/services/enterprise-services/` – Enterprise
- `/services/startup-product-development/` – Startup
- `/services/devops-consulting/` – DevOps
- `/services/custom-online-marketplace-development/` – Marketplace
- `/services/product-engineering/` – Product Engineering
- `/services/content-marketing/` – Content Marketing
- `/services/social-media-marketing/` – SMM
- `/services/search-engine-optimization/` – SEO
- `/services/digital-consulting/` – Digital Consulting
- `/services/graphic-design/` – Graphic Design
- `/services/ppc/` – PPC

### C. Industry / Solutions (9 Endpoints)

- `/learning-management-systems/` – LMS
- `/directory-website-design/` – Directory Design
- `/ecommerce-development-services/` – Ecommerce
- `/job-portal-development/` – Job Portal
- `/travel-portal-development-company/` – Travel Portal
- `/healthcare-software-development/` – Healthcare
- `/elearning-software-development/` – Elearning
- `/saas-development-services/` – SaaS
- `/ai-development-services-for-lawyers-and-law-firms/` – AI For Lawyers

### D. Case Studies (7 Endpoints)

- `/case-study/hitachi/` – Hitachi
- `/case-study/farmers-eats/` – Farmers Eats
- `/case-study/ai-copywriting-tool/` – AI Copywriting
- `/case-study/lawyer-pro/` – Lawyer Pro
- `/case-study/legal-help/` – Legal Help
- `/case-study/fetchrocket/` – FetchRocket
- `/case-study/vertex-foods/` – Vertex Foods

### E. Blog Pagination (5 Endpoints)

- `/blog/page/2/` – Blog Page 2
- `/blog/page/3/` – Blog Page 3
- `/blog/page/4/` – Blog Page 4
- `/blog/page/5/` – Blog Page 5
- `/blog/page/6/` – Blog Page 6

### F. Careers (9 Endpoints)

- `/careers/business-development-executive/` – BDE
- `/careers/human-resource-executive/` – HR
- `/careers/digital-marketing-expert/` – Digital Marketing
- `/careers/flutter-developer/` – Flutter
- `/careers/web-developer/` – Web Dev
- `/careers/wordpress-developer/` – WordPress
- `/careers/mobile-app-developer/` – Mobile
- `/careers/unity-developer/` – Unity
- `/careers/web-designer/` – Web Designer

### G. Press (Detail) (1 Endpoint)

- `/press/vendorland/` – Vendorland

### H. Blog Articles (5 Endpoints)

- `/blog/google-antigravity-your-path-to-a-billion-dollar-company/` – Google Antigravity
- `/blog/software-development-cost-estimation-2026/` – Software Development Cost Estimation 2026
- `/blog/ai-code-review-in-2025-whats-real-and-whats-hype/` – AI Code Review 2025
- `/blog/unleashing-bigquerys-unified-multimodal-power-for-ai/` – BigQuery Unified Multimodal AI
- `/blog/explore-agentic-ai-autonomous-problem-solvers-today/` – Explore Agentic AI

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Saturday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **Techwink: Automation**.
3. Click **Run workflow**.
4. Download the **`techwink-report`** artifact from the mail.

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

From the Techwink folder:

```bash
cd techwink
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
