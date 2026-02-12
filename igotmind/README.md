<!-- @format -->

# I Got Mind – Automated QA Suite

## 1. Project Overview

This directory contains the **Playwright Automation Suite** for  
👉 **https://igotmind.ca**

It focuses on **Visual Regression & Core Page Validation**, ensuring that
key pages render consistently across all supported devices.

---

## 2. Architecture

The automation suite follows a **modular and centralized structure** to ensure
maintainability and deterministic visual testing.

| File / Folder                 | Description                             |
| :---------------------------- | :-------------------------------------- |
| `tests/public.spec.js`        | Public page validation + visual checks  |
| `tests/authenticated.spec.js` | Auth flow + dashboard validation        |
| `tests/*.spec.js-snapshots/`  | Baseline visual snapshots               |
| `playwright.config.js`        | Device matrix & execution configuration |

---

## 3. Configuration & Specifications

### Global Settings

- **Base URL:** `https://igotmind.ca`
- **Execution Mode:** Parallel
- **Visual Tolerance:** `maxDiffPixelRatio: 0.02`
- **Stabilization:** No custom stabilization utilities are configured

---

## 4. Test Scope

The following endpoints are validated through **full-page visual regression**
across all configured devices.

### A. Public Pages (12 Endpoints)

- `/` – Home
- `/about/` – About Us
- `/sports/` – Sports Programs
- `/business/` – Corporate Programs
- `/4-the-boys/` – Scholarship
- `/book-now/` – Contact Us
- `/forsportsandeducation/` – Non-Profit
- `/my-courses/` – Login Page
- `/my-courses/lost-password/` – Password Reset
- `/tlw/` – The Little Warriors
- `/membership/front-of-line-membership/` – Membership Flow
- `/purchase/` – Purchase Flow

### B. Authenticated Journey (12 Endpoints)

- `/my-courses/` – Dashboard
- `/my-courses/my-courses/` – My Courses
- `/my-courses/my-grades/` – My Grades
- `/my-courses/my-memberships/` – My Memberships
- `/my-courses/my-private-area/` – Private Area
- `/my-courses/my-achievements/` – Achievements
- `/my-courses/my-certificates/` – Certificates
- `/my-courses/my-notes/` – My Notes
- `/my-courses/notifications/` – Notifications
- `/my-courses/edit-account/` – Edit Account
- `/my-courses/redeem-voucher/` – Redeem Voucher
- `/my-courses/orders/` – Order History

---

## 5. Execution Option A: Cloud (GitHub Actions)

**Schedule:** Every Monday at **9:00 AM IST** (**03:30 AM UTC**).

1. Navigate to the **Actions** tab.
2. Select **I Got Mind: Automation**.
3. Click **Run workflow** (or wait for the scheduled run).
4. Download the **`igotmind-report`** artifact from the run.

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

From the I Got Mind folder:

```bash
cd igotmind
npx playwright test
```

### Optional Commands

- **Update Snapshots:** `npx playwright test --update-snapshots`
- **View Report:** `npx playwright show-report`
