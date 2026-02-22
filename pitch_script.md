# Project: AI-Powered Adaptive Learning Platform

## 1. The Elevate Pitch (1 Minute)
"Ever felt overwhelmed by a textbook that doesn't care if you're struggling or bored? We’ve built an **AI-Powered Adaptive Learning Platform** that acts as a 1-on-1 tutor for every student. It doesn't just deliver content; it adapts in real-time. If you're crushing it, we push you with 'Challenge' levels. If you're stuck, our AI Mentor identifies accurately *why* and bridges the gap. With built-in gamification like XP and Scholar Status, and a first-of-its-kind AI-driven anti-cheat system, we’re making education both personalized and integrous. We’re not just an app; we’re an evolution in how we learn."

---

## 2. Hackathon-Level Breakdown

### The Problem
Traditional education is "one size fits all." Fast learners get bored, and slow learners get left behind. Additionally, online assessments are plagued by academic dishonesty, making digital certifications less reliable.

### The Solution: "The Adaptive Engine"
Our platform uses a 4-tier learning architecture:
1.  **Diagnostic**: Pinpoints your starting level.
2.  **Adaptive Progression**: Users move through Beginner, Intermediate, and Advance levels. The system monitors speed and accuracy.
3.  **Real-time Upgrades/Downgrades**: If a student clears 3 'Hard' questions consecutively under 25 seconds, the AI **upgrades** them immediately. If they miss 2 'Medium' questions, it **downgrades** to solidify basics.
4.  **AI Feedback Loop**: After every quiz, our **AI Mentor** (powered by Gemini & OpenAI) analyzes wrong answers to provide personalized recommendations, not just "correct" keys.

### The Tech Stack
-   **Backend**: Express.js with TypeScript for robust, type-safe API logic.
-   **Database**: PostgreSQL with Prisma ORM for high-performance data modeling.
-   **Generative AI**: Dual-Provider Strategy. We use **Gemini 1.5 Flash** for high-speed feedback and **OpenAI GPT-4o-mini** as a primary/fallback layer, ensuring 100% uptime.
-   **Security**: Sophisticated anti-cheat logic detecting tab-switching, fast completion patterns, and suspicious score jumps.

### Unique "Wow" Factors
-   **Dual-AI Fallback**: If one AI API hits a rate limit, the system automatically rotates to the next, ensuring uninterrupted learning.
-   **Gamified Scholarship**: Students earn XP and climb from 'Learner' to 'Elite Scholar,' making study feel like an RPG.
-   **Behavioral Anti-Cheat**: We don't just block; we analyze patterns (like answer speed and tab switches) to flag suspicious behavior.

---

## 3. The Technical Walkthrough (For Judges)
"Under the hood, our `quizController` isn't just a CRUD app. It’s an evaluation engine. We use a **Pattern Detection Algorithm** to monitor user behavior. For example, if you finish a 10-question quiz in 30 seconds, the system flags you. On the AI side, we implemented a **Service Layer** that abstracts multiple AI providers, making our infrastructure resilient. Our data schema handles complex relations between subjects, chapters, levels, and user progress, allowing for a seamless 'Level Lock' experience."
