# 🚀 Trendora - The Ultimate AI Content & Agency Platform

Welcome to **Trendora**! If you are entirely new to this project, this document will serve as your ultimate guide. It explains exactly what Trendora is, the technologies it uses, how the entire system works step-by-step, and a complete breakdown of its features.

---

## 📖 What is Trendora?
Trendora is an advanced, multi-tenant SaaS (Software as a Service) platform powered by Artificial Intelligence (Google Gemini). It is designed to help three specific types of users—**Creators**, **Businesses**, and **Agencies**—to automate their social media growth, generate high-quality marketing content, and manage clients efficiently. 

Instead of switching between ChatGPT, Notion, and scheduling tools, Trendora brings AI content generation, saved content pipelines, and project management into a single, beautiful dashboard.

---

## 🛠️ Tech Stack (Abhi tak kya use hua hai)
- **Frontend Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (for modern, responsive, and beautiful UI)
- **Database**: MongoDB (with Mongoose ODM for schemas)
- **AI Engine**: Google Gemini API (currently using the latest `gemini-3.6-flash` model for high-speed, accurate generation)
- **Authentication**: Custom JWT (JSON Web Tokens) with Role-Based Access Control
- **Date Formatting**: `date-fns` library for handling timestamps and UI dates.
- **Security**: `bcryptjs` for secure password hashing.

---

## ⚙️ How it Works: Step-by-Step Flow (Kaise Kaam Karega)

If a new user comes to Trendora, here is the exact journey they take:

### Step 1: Registration & Role Selection
When a user signs up, they must select who they are:
- A **Creator** (YouTuber, Influencer, Podcaster)
- A **Business** (SaaS, E-commerce, Local Shop)
- An **Agency** (Managing multiple businesses or creators)

### Step 2: Smart Onboarding & Profile Setup
Based on their role, Trendora asks them specific questions to build a unique "Brand Memory".
- **Creators** set their Niche, Platform (Instagram/YouTube), Tone (Educational/Funny), and Goals.
- **Businesses** set their Industry, Products/Services, Marketing Budget, and Brand Voice.
- **Agencies** set their Team Size, Services provided, and Brand Colors.

### Step 3: The Custom Dashboard
Once onboarding is complete, the user is redirected to a dashboard entirely customized for their role. A Creator won't see Business tools, and a Business won't see Agency tools.

### Step 4: AI Content Generation
This is the core engine of Trendora. Users go to their respective AI tools (e.g., "Generate Hook" or "Generate Ad Copy"). They provide a short prompt, and Trendora's backend communicates with **Google Gemini 3.6 Flash** to generate highly contextual content based on their previously saved Profile setup.

### Step 5: Content Pipeline & Saving
Once content is generated, users can save it. Saved content enters a **Pipeline** (Ideation ➔ Draft ➔ Review ➔ Published). This acts as a mini-Trello board for their content lifecycle.

---

## 🌟 Detailed Features (Kya kya features hain isme)

### 1. 🎨 For Creators (Creator Workspace)
- **AI Video Hooks**: Generate scroll-stopping intros for Reels/Shorts.
- **Full Video Scripts**: AI-written scripts with intro, body, and outro formatting.
- **Smart Captions & Hashtags**: Social media-ready text.
- **Viral Ideas**: AI analyzes their niche to suggest trending video topics.
- **Thumbnail Titles**: Clickable, high-CTR titles for YouTube.

### 2. 🏢 For Businesses (Business Workspace)
- **Ad Copy Generator**: High-converting Facebook, Instagram, or LinkedIn ads.
- **Local SEO & Blogs**: Automatically generate SEO-optimized blog posts to rank higher on Google.
- **Review Replies**: AI drafts polite and professional responses to Google/Yelp customer reviews.
- **Product Descriptions**: Engaging e-commerce copy.
- **Automated WhatsApp Replies**: Draft professional chat responses for customer inquiries.

### 3. 🤝 For Agencies (Agency Workspace)
- **Client Management (CRM)**: Add and manage multiple clients (both Creators and Businesses).
- **Task Management**: Create projects, assign priorities (High, Medium, Low), and track deadlines for each client.
- **Proxy AI Generation**: Select a specific client from a dropdown, and generate content *on their behalf* (the AI will automatically adopt that specific client's tone and brand voice).

### 4. 👑 For Super Admins (Admin Workspace)
- **Global User Management**: View all registered accounts, their workspace types, and subscription plans.
- **Status Tracking**: See who is Active, Suspended, or on a Trial.

---

## 📂 Project File Structure (Code Kahan Hai)

```text
trendora/
├── src/
│   ├── app/                  
│   │   ├── admin/            # 👑 Admin pages & UI
│   │   ├── agency/           # 🤝 Agency dashboard & tools
│   │   ├── business/         # 🏢 Business dashboard & tools
│   │   ├── creator/          # 🎨 Creator dashboard & tools
│   │   ├── api/              # ⚙️ Backend Logic (Routes for Auth, AI Generation, Data fetching)
│   │
│   ├── components/           # 🧩 Reusable React components (Buttons, Tables, Modals, Drawers)
│   │
│   ├── lib/                  # 🛠️ Utility functions (MongoDB connection, JWT generation/verification)
│   │
│   ├── models/               # 🗄️ Database Schemas (Mongoose)
│   │   ├── User.js                 # Base user credentials and roles
│   │   ├── CreatorProfile.js       # Creator brand memory
│   │   ├── BusinessProfile.js      # Business brand memory
│   │   ├── AgencyProfile.js        # Agency settings
│   │   ├── AgencyClient.js         # Agency's clients
│   │   ├── AgencyTask.js           # Agency's to-do list
│   │   ├── GeneratedContent.js     # History of all AI generations
│   │   ├── SavedContent.js         # Content saved to the pipeline
│   │
│   └── services/             # 🌐 Frontend fetch wrappers to communicate with /api easily
│
├── scripts/
│   └── seed.js               # 🌱 Script to auto-fill the database with dummy test users & realistic AI content!
│
├── public/                   # 🖼️ Images and static files
├── package.json              # 📦 Project dependencies
└── .env.local                # 🔑 API Keys (Gemini, Mongo URL, JWT Secret)
```

---

## 💻 How to setup and run this project

If a developer wants to run this on their machine:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure `.env.local` is present with `MONGO_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.

3. **Generate Dummy Data (Highly Recommended):**
   This script bypasses the onboarding screen and generates realistic test accounts (Admin, Creator, Business, Agency) with fully populated dashboards, mock clients, and AI content.
   ```bash
   npm run seed
   ```

4. **Start the App:**
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` and log in with the test accounts generated by the seed script.*
