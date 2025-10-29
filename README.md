ar
git add .
Easy Speech AAC is a free, web-based communication and organization platform designed to empower nonverbal individuals—especially those with autism—to express themselves, manage routines, and track emotions. Built with accessibility and empathy at its core, the app combines AAC features, mood tracking, gamified learning, and caregiver analytics in a single, modern tool.

Easy Speech AAC is a comprehensive, modern, and accessible web application designed to empower nonverbal individuals by providing them with powerful tools for communication, organization, and emotional expression. Inspired by personal experience, the app is built as a free, nonprofit tool to serve as a powerful and low-cost alternative to expensive, dedicated AAC devices.

## Core Features

*   **Guest/Demo Mode**: Explore features offline without creating an account
*   **Cloud Sync**: Automatic save; works on any device and is tied to a user account via Google authentication. All user data is securely stored and isolated by individual accounts. Guest data remains local to the device, while authenticated users’ information is encrypted and synced in real time via Firebase.
*   **Customizable Phrases & Soundboard**: Express wants, needs, feelings, and words.
*   **Interactive Daily Planner**: Drag-and-drop schedule with gamified points to motivate users.
*   **Mood Tracking & Analytics**: Log moods, receive tips, and view charts to see patterns.
*   **Gamified Learning**: Games like Sentence Builder and Emotion Match improve language and emotional recognition.
*   **Secure Caregiver Notes**: Passcode-protected for private observations.
*   **"About Me" Page**: Share info (likes, dislikes, allergies, etc.) with teachers or new caregivers.

I built this project independently, keeping it free or low-cost (about $5–8 per year to cover hosting). It was a huge learning experience: 2 weeks of researching, 2 months of programming, and nearly a month refining the interface.

## Technology Stack
*   **Framework**: Built with Next.js and React for a fast, responsive, and modern user experience.
*   **Styling**: Uses Tailwind CSS and ShadCN UI components, providing a clean, professional, and accessible design system with Light/Dark themes and a unique "Calm Mode."
*   **Backend**: Powered by Firebase, using Firestore for real-time data storage and Firebase Authentication for secure user management via Google Sign-In.
*   **Accessibility**: Designed in accordance with WCAG 2.1 AA standards, Easy Speech AAC supports screen readers, high-contrast visuals, adjustable font sizes, and Calm Mode for sensory-sensitive users.

I'd be grateful for feedback—especially on usability, bugs, or missing features. How could this be more helpful for both users and caregivers?

Thanks for checking it out!

---

## **How to Fix "Something Went Wrong" Deployment Errors**

If your deployments are failing with a generic "Something went wrong" message, it almost always means there is a configuration problem in your Google Cloud project. Please follow these two steps carefully.

### **Fix 1: Delete Conflicting App Hosting Backends**

Having more than one App Hosting backend can cause resource conflicts and make deployments fail. You must have only one.

1.  **Click this link** to go to the Firebase Hosting page for your project:
    [https://console.firebase.google.com/project/studio-2230367721-f4c43/hosting/sites](https://console.firebase.google.com/project/studio-2230367721-f4c43/hosting/sites)

2.  You should see a list of backends. **Identify the one you want to keep.** Your active backend is likely the one that was updated most recently.

3.  **Delete any other backends.** For any backend you do **not** want to keep, click the three-dot menu (**⋮**) and select **"Delete backend."**

4.  Ensure you are left with only **one** backend.

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
