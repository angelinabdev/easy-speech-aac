# How to Fix "Something Went Wrong" Deployment Errors

If your deployments are failing with a generic "Something went wrong" message, it almost always means there is a configuration problem in your Google Cloud project. Please follow these two steps carefully.

---

### **Fix 1: Delete Conflicting App Hosting Backends**

Having more than one App Hosting backend can cause resource conflicts and make deployments fail. You must have only one.

1.  **Click this link** to go to the Firebase Hosting page for your project:
    [https://console.firebase.google.com/project/studio-2230367721-f4c43/hosting/sites](https://console.firebase.google.com/project/studio-2230367721-f4c43/hosting/sites)

2.  You should see a list of backends. **Identify the one you want to keep.** Your active backend is likely the one that was updated most recently.

3.  **Delete any other backends.** For any backend you do **not** want to keep, click the three-dot menu (**⋮**) and select **"Delete backend."**

4.  Ensure you are left with only **one** backend.

---

### **Fix 2: Grant Correct IAM Permissions**

The service account that deploys your app needs specific permissions to work correctly.

1.  **Click this link** to go directly to the IAM page for your project:
    [https://console.cloud.google.com/iam-admin/iam?project=studio-2230367721-f4c43](https://console.cloud.google.com/iam-admin/iam?project=studio-2230367721-f4c43)

2.  At the top of the page, click **+ GRANT ACCESS**.

3.  In the **New principals** field that appears, paste the following service account email address:
    `service-181528715129@gcp-sa-firebaseapphosting.iam.gserviceaccount.com`

4.  In the **Select a role** dropdown, search for and select the **Firebase App Hosting Admin** role.

5.  Click **Save**.

After completing **both** of these steps, please try deploying your application one more time from Firebase Studio.