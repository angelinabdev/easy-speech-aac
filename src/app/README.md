
# App Overview & Deployment Guide

## About This App

This is a Next.js application built with React, TypeScript, and Tailwind CSS. It is deployed using Firebase App Hosting.

---

## How to Fix Deployment Errors

If your deployments are failing, it is likely due to one of two common issues: a disabled API or incorrect project permissions. Please follow these steps carefully.

### **Fix 1: Enable the Cloud Build API**

The error `status.code: 9` or errors related to the `Cloud Build API` mean the necessary API is not enabled for your project.

1.  **Go to the Cloud Build API page** in the Google Cloud Console for your project by clicking this link:
    [https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=studio-2230367721-f4c43](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com?project=studio-2230367721-f4c43)
2.  Click the **Enable** button. If it is already enabled, you do not need to do anything for this step.

---

### **Fix 2: Grant App Hosting Admin Permissions**

If you see a "Permission denied" error, it means the service account deploying your application is missing the necessary permissions.

1.  **Go to the IAM page** in the Google Cloud Console:
    [https://console.cloud.google.com/iam-admin/iam?project=studio-2230367721-f4c43](https://console.cloud.google.com/iam-admin/iam?project=studio-2230367721-f4c43)
2.  Find the service account with "App Hosting" in its name. The email will look like:
    `service-PROJECT_NUMBER@gcp-sa-firebaseapphosting.iam.gserviceaccount.com`
3.  Click the **pencil icon** (Edit principal) for that service account.
4.  Click **+ ADD ANOTHER ROLE**.
5.  In the "Select a role" dropdown, search for and select **Firebase App Hosting Admin**.
6.  Click **Save**.

After completing these steps, please try deploying your application one more time from Firebase Studio.
