<!-- @format -->

# QA Automation Monorepo

This repository hosts the automated test suites for multiple client websites.
Each site is isolated in its own directory with its own configuration, secrets, and schedule.

## 📂 Project Structure

| Client                                                                                                            | Folder                | Description                         |
| ----------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------- |
| **I Got Mind**<br><br>([https://igotmind.ca/](https://igotmind.ca/))                                              | `/igotmind`           | Authenticated + public flows        |
| **DigiBot App**<br><br>([https://digibotapp.com](https://digibotapp.com))                                         | `/digibotapp`         | Public visual regression            |
| **Naturally Beautiful**<br><br>([https://naturallybeautifulhaircare.com](https://naturallybeautifulhaircare.com)) | `/naturallybeautiful` | Smoke + full-page visual regression |
| **Inventor Market**<br><br>([https://www.inventor.market](https://www.inventor.market))                           | `/inventormarket`     | Smoke + full-page visual regression |
| **Microlocs**<br><br>([https://microlocs.com](https://microlocs.com))                                             | `/microlocs`          | Smoke + full-page visual regression |
| **Microloc Directory**<br><br>([https://microlocdirectory.com](https://microlocdirectory.com))                    | `/microlocsdirectory` | Smoke + full-page visual regression |
| **Techwink**<br><br>([https://techwink.net](https://techwink.net))                                                | `/techwink`           | Smoke + full-page visual regression |
| **The Fourth Twenty**<br><br>[https://thefourthtwenty.ca](https://thefourthtwenty.ca)                             | `/thefourthtwenty`    | Smoke + full-page visual regression |

---

## 🚀 How to Run Manually (Cloud)

To trigger a test run immediately (e.g., after a fix or deployment):

1. Go to the **[Actions Tab](https://github.com/sowlab/playwright-visual-suite/actions)**.
2. On the left sidebar, select the specific workflow (e.g., **"DigiBot: Automation"**).
3. Click the **Run workflow** button on the right side.
4. Select the `main` branch and click **Run workflow**.

---

## 📊 How to View Reports

1. Open the email notification you received (Subject: _"QA Report..."_).
2. Click the drive link in the email and download the report.
3. Extract the zip and open `index.html` to view the full interactive dashboard.

---

## 📅 Schedules

The automation runs automatically based on the schedules defined in `.github/workflows/`.

| Client                  | Schedule (IST)           |
| ----------------------- | ------------------------ |
| **I Got Mind**          | Mondays @ 9:00 AM IST    |
| **DigiBot App**         | Tuesdays @ 9:00 AM IST   |
| **The Fourth Twenty**   | Tuesdays @ 9:00 AM IST   |
| **Naturally Beautiful** | Wednesdays @ 9:00 AM IST |
| **Inventor Market**     | Thursdays @ 9:00 AM IST  |
| **Microlocs**           | Fridays @ 9:00 AM IST    |
| **Microloc Directory**  | Fridays @ 9:00 AM IST    |
| **Techwink**            | Saturdays @ 9:00 AM IST  |

### How to Change the Schedule

1. Open the workflow file (e.g., `.github/workflows/naturallybeautiful.yml`).
2. Find the `schedule` block near the top:

```yaml
schedule:
  - cron: "30 3 * * 3"
```

3. Update the numbers using **[Crontab.guru](https://crontab.guru/)**.
4. **Important:** GitHub uses **UTC Time**. You must convert your desired IST time to UTC.

- _Formula: IST - 5 hours 30 minutes = UTC._
- _Example: 9:00 AM IST = 3:30 AM UTC._

---

## 🗂 Corporate Google Drive – Report Storage Setup

QA reports are uploaded to a **corporate Google Drive** using OAuth authentication.
This ensures centralized ownership, long-term access, and independence from individual user accounts.

### 🔐 Required GitHub Secrets

The following secrets must be configured at the repository level:

| Secret Name            | Description                            |
| ---------------------- | -------------------------------------- |
| `GDRIVE_CLIENT_ID`     | OAuth Client ID (Google Cloud project) |
| `GDRIVE_CLIENT_SECRET` | OAuth Client Secret                    |
| `GDRIVE_REFRESH_TOKEN` | OAuth refresh token                    |

Secrets are managed under:  
**GitHub → Repository → Settings → Secrets and variables → Actions**

---

## 🛠 Corporate Google Drive Configuration (One-Time Setup)

### Step 1: Create Google Cloud Project

1. Open **Google Cloud Console**
2. Create a new project (example: `qa-automation-reports`)
3. Enable **Google Drive API**

---

### Step 2: Configure OAuth Consent Screen

- User type: **Internal** (recommended for corporate environments)
- App name: `QA Automation`
- OAuth scope:https://www.googleapis.com/auth/drive
- Publish the consent screen

---

### Step 3: Create OAuth Client

1. Go to **APIs & Services → Credentials**
2. Create **OAuth Client ID**
3. Application type: **Desktop App**
4. Save the generated **Client ID** and **Client Secret**

---

### Step 4: Generate Refresh Token

Generate an OAuth **refresh token** using the created client.

- This token allows GitHub Actions to upload files non-interactively
- The token is long-lived and does not expire unless revoked
- Store it as `GDRIVE_REFRESH_TOKEN`

---

## 🧹 Changing Report Retention Days

QA reports stored in the corporate Google Drive are cleaned up automatically based on a configurable retention period.

---

### ✏️ How to Update Retention Days

1. Go to **GitHub → Repository → Settings**
2. Open **Secrets and variables → Actions**
3. Locate the secret:

   ```
   DRIVE_REPORT_RETENTION_DAYS
   ```

4. Click **Edit**
5. Enter the desired number of days (integer only)

#### Examples

| Requirement              | Value |
| ------------------------ | ----- |
| Keep reports for 7 days  | `7`   |
| Keep reports for 30 days | `30`  |
| Keep reports for 60 days | `60`  |

6. Save the secret

📌 The new value will be applied automatically on the **next scheduled cleanup run**.

---

### ▶️ Manual Override (Optional)

If immediate cleanup is required:

1. Go to the **Actions** tab
2. Select **“Cleanup old Drive reports”**
3. Click **Run workflow**
4. Enter a custom value for **Retention Days**
5. Run the workflow

This overrides the secret **for that run only**.

---
