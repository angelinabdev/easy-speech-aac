# Easy Speech AAC

**A free, full-stack communication platform designed to empower nonverbal and neurodivergent users through accessible, customizable tools.**

Built as a response to major gaps in current assistive technology, this Progressive Web App (PWA) combines communication, daily planning, and emotional tracking tools to help users build independence and connection.

---
## Mission

To make expressive, dignified communication accessible to everyone — regardless of income, disability, or background.  
The project began from lived caregiving experience and continues to evolve through feedback from families and accessibility advocates.

---

## Features

### Communication & Expression

* **Customizable Soundboard & Phrase Builder**
  Organize and speak phrases by category: Want, Need, Feel, and Words.

* **Text-to-Speech Support**
  Phrases are spoken aloud using a variety of Google voice options.

* **Sentence Builder**
  Drag-and-drop activity helps users practice forming complete sentences.

### Organization & Routine Building

* **Visual Daily Planner**
  Drag-and-drop scheduler with printable format for offline use.

* **Gamified Task Completion**
  Users earn points and level up by completing tasks, encouraging engagement.

* **Printable Visual Schedules**
  Downloadable for use by teachers, caregivers, or therapists.

### Emotional Tracking & Support

* **Mood Tracker**
  Simple interface allows users to log daily moods.

* **Coping Tips**
  After mood logging, the platform offers tailored coping strategies.

* **Mood Analytics Dashboard**
  Visual chart and written journal track emotional patterns over time.

### Caregiver & Professional Tools

* **Private Caregiver Notes**
  Passcode-protected section for logging progress or behavioral notes.

* **Data Export**
  Download mood trends, completed tasks, and phrase usage as a CSV or formatted PDF report.

* **Role-Based UI**
  The interface adjusts depending on user type (caregiver vs. individual user).

### Accessibility & Customization

* **Calm Mode**
  Sensory-friendly color palette and reduced visual stimulation.

* **Dark Mode & Large Text Options**
  Built-in settings for visual accessibility.

* **About Me Digital Passport**
  Centralized profile storing emergency contacts, preferences, medical notes, and key information. Exportable for use in schools or clinics.

* **Offline-First Functionality**
  All features work offline and sync automatically when reconnected.

* **Authentication Options**
  Google Sign-In for syncing across devices or Guest Mode for private, local use.

---

## Tech Stacks

| Frontend        | Backend & Storage           | Additional Tools              |
| --------------- | --------------------------- | ----------------------------- |
| Next.js (React) | Firebase Auth               | Google TTS API                |
| Tailwind CSS    | Firestore (Offline support) | Chart.js (data visualization) |
| PWA support     | Firebase Hosting            | CSV & PDF export functions    |

---

## ♿ Accessibility
Easy Speech AAC was designed **accessibility-first**:
- 100 / 100 **Lighthouse Accessibility** and **SEO** scores  
- ARIA roles, semantic HTML, and visible focus indicators  
- Screen-reader compatible, high-contrast compliant (WCAG 2.1 AA)  
- Audited with **axe DevTools** and manual keyboard testing  

> Recognized by an accessibility professional active in assistive-tech communities for innovation in free communication tools.

---

## Development Roadmap

* [x] Secure caregiver-only tools with passcode protection
* [x] Exportable mood and schedule reports (PDF/CSV)
* [x] Gamified user dashboard
* [ ] Add multilingual interface
* [ ] Long-term device compatibility with external AAC hardware

---

## Purpose

This project was born from a personal need. As a caregiver to a nonverbal, autistic sibling, I experienced firsthand the barriers families face in finding affordable, intuitive, and flexible AAC tools. Easy Speech AAC reflects the belief that technology should meet users where they are — and help them grow beyond.

---

## Contact

If you'd like to learn more or collaborate:

**Email:** [easyspeechaac@gmail.com](mailto:easyspeechaac@gmail.com)
**Website:** [https://easyspeechaac.com](https://easyspeechaac.com)
**GitHub:** [https://github.com/angelinabdev](https://github.com/angelinabdev)
**Reddit:** [Disastrous-Motor4217](https://www.reddit.com/user/Disastrous-Motor4217/)  
**Instagram:** [@easyspeechaac](https://www.instagram.com/easyspeechaac)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/angelinabdev/easy-speech-aac.git
cd easy-speech-aac
npm install

# Run locally
npm run dev
