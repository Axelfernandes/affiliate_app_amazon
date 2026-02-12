# 🤖 Auto-Niche: AI-Driven Affiliate Micro-SaaS
> **The future of affiliate marketing: Fusing Gemini 2.x creativity with real-time retailer intelligence.**

[![Amplify Gen 2](https://img.shields.io/badge/AWS-Amplify_Gen_2-FF9900?logo=amazonservices&logoColor=white)](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/)
[![Gemini 2.x](https://img.shields.io/badge/Google-Gemini_2.x-4285F4?logo=googlegemini&logoColor=white)](https://aistudio.google.com/app/prompts/new)
[![Vite 6](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind 4](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

- **🛡️ Secret Guard**: Native Husky + Git hooks integration to prevent sensitive `.env` leaks.
- **📈 Real Price Tracking**: Live 1:1 price tracking with historical delta visualization (Keepa-style).
- **🌪️ AI Forge**: High-fidelity product review generation using **Gemini 2.5 Flash**.
- **🔌 Multi-API Fusion**: Automated data fetching from **Rainforest (Amazon)** and **Best Buy** for factual accuracy.
- **💎 Premium UI**: A high-contrast, research-backed interface featuring Glassmorphism and responsive data charts.

---

## 🏗️ Architecture

```mermaid
graph TD
    A[Vite 6 Frontend] -->|Auth| B(Amplify Auth)
    A -->|Data/Mutations| C(Amplify Data Manager)
    C -->|Trigger| D[AWS Lambda Forge]
    D -->|Context| E{Multi-API Router}
    E -->|Fetch Facts| F[Rainforest / Best Buy APIs]
    E -->|Generate Creative| G[Gemini 2.5 Flash]
    F --> H(Fused Rich Content)
    G --> H
    H -->|Optimized JSON| C
```

---

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript + Vite 6
- **Backend**: AWS Amplify Gen 2 (AppSync, Lambda, DynamoDB)
- **AI**: Google Generative AI (Gemini 2.5/2.0 family)
- **Data APIs**: Rainforest API (Amazon), Best Buy Developer API
- **Styling**: Tailwind CSS 4 + Lucide Icons + Recharts

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [AWS Account](https://aws.amazon.com/)
- [Google AI Studio Key](https://aistudio.google.com/app/apikey)

### 2. Installation
```bash
git clone https://github.com/Axelfernandes/affiliate_app_amazon.git
cd affiliate_app_amazon
npm install
```

### 3. Environment Setup
Create a `.env` file based on the template:
```bash
cp .env.example .env
# Fill in your API keys
```

### 4. Development
```bash
# Terminal 1: Start Amplify Sandbox
npx ampx sandbox

# Terminal 2: Start Vite Dev Server
npm run dev
```

---

## ⚖️ License
Released under the MIT License. Built with ❤️ by Antigravity.
