# Easy Speech AAC

Easy Speech AAC is a free, nonprofit communication platform built for individuals with autism, intellectual disabilities, and other communication challenges. Designed through both personal and professional experience, this tool removes the financial and usability barriers often found in existing AAC (augmentative and alternative communication) systems. Its mission is to empower users, caregivers, and educators through accessible technology.

Live Demo: https://easyspeechaac.com

---

## Mission

I created Easy Speech AAC after years of supporting my autistic, nonverbal brother. Many AAC tools were expensive, inflexible, or failed to meet his needs — so I built one. The goal is to make communication an accessible right rather than a privilege.

"Every voice matters — even the ones that haven’t been heard yet."

---

## Features

- Cloud Sync – Save and access data across devices using secure Google login
- Custom Communication Tools – Create soundboards and phrase lists for wants, needs, feelings, and more
- Interactive Daily Planner – Drag-and-drop tasks and visualize routines with an optional reward system
- Mood Tracking with Visual Analytics – Log emotions, get feedback, and identify patterns over time
- Gamified Learning – Includes Sentence Builder and Emotion Match for developing language and emotional recognition skills
- Secure Caregiver Notes – Private section protected by a passcode for observations and notes
- CSV Export – Download logs and data for sharing with therapists or medical professionals
- “About Me” Page – Summarize user preferences, safety info, and essentials for caregivers, teachers, and providers

---

## Tech Stack

| Area                | Technology                    |
|---------------------|-------------------------------|
| Framework           | Next.js (App Router)          |
| Language            | TypeScript                    |
| UI                  | React, ShadCN UI, Tailwind CSS|
| Database            | Firebase Firestore            |
| Authentication      | Firebase Auth                 |
| Speech Synthesis    | Web Speech API                |
| Drag & Drop         | dnd-kit                       |

---

## Getting Started

If you want to run Easy Speech AAC locally, follow these steps:

```bash
# Clone repository
git clone https://github.com/angelinabdev/easy-speech-aac.git
cd easy-speech-aac

# Install dependencies
npm install

# Start development server
npm run dev
