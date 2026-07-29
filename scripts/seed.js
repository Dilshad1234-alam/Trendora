const { loadEnvConfig } = require('@next/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from .env.local
try {
  loadEnvConfig(process.cwd());
} catch (e) {
  // Ignored
}

if (!process.env.MONGO_URL) {
  const fs = require('fs');
  const path = require('path');
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.replace(/\\n/gm, '\n');
        }
        value = value.replace(/(^['"]|['"]$)/g, '').trim();
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.error('Could not load .env.local manually', err);
  }
}

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
  console.error("Please define the MONGO_URL environment variable inside .env.local");
  process.exit(1);
}

// User Schema
const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: { type: String, select: false },
  role: String,
  workspace: String,
  onboardingCompleted: Boolean,
  agencyOnboardingCompleted: Boolean,
  plan: String,
  planSelected: Boolean,
  trialStartDate: Date,
  trialEndsAt: Date,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Profile Schemas (strict: false allows arbitrary fields that the frontend might expect later)
const businessProfileSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }, { strict: false });
const BusinessProfile = mongoose.models.BusinessProfile || mongoose.model("BusinessProfile", businessProfileSchema);

const creatorProfileSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }, { strict: false });
const CreatorProfile = mongoose.models.CreatorProfile || mongoose.model("CreatorProfile", creatorProfileSchema);

const agencyProfileSchema = new mongoose.Schema({ agencyId: mongoose.Schema.Types.ObjectId }, { strict: false });
const AgencyProfile = mongoose.models.AgencyProfile || mongoose.model("AgencyProfile", agencyProfileSchema);

// Demo Data Schemas
const generatedContentSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, agencyId: mongoose.Schema.Types.ObjectId, clientId: mongoose.Schema.Types.ObjectId }, { strict: false });
const GeneratedContent = mongoose.models.GeneratedContent || mongoose.model("GeneratedContent", generatedContentSchema);

const savedContentSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, agencyId: mongoose.Schema.Types.ObjectId, clientId: mongoose.Schema.Types.ObjectId }, { strict: false });
const SavedContent = mongoose.models.SavedContent || mongoose.model("SavedContent", savedContentSchema);

const agencyClientSchema = new mongoose.Schema({ agencyId: mongoose.Schema.Types.ObjectId }, { strict: false });
const AgencyClient = mongoose.models.AgencyClient || mongoose.model("AgencyClient", agencyClientSchema);

const agencyTaskSchema = new mongoose.Schema({ agencyId: mongoose.Schema.Types.ObjectId, clientId: mongoose.Schema.Types.ObjectId }, { strict: false });
const AgencyTask = mongoose.models.AgencyTask || mongoose.model("AgencyTask", agencyTaskSchema);

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 7);

    const testAccounts = [
      {
        fullname: "Admin",
        email: "admin@test.com",
        password: "12345678",
        role: "admin",
        workspace: "admin",
        plan: "free"
      },
      {
        fullname: "Creator Test",
        email: "creator@test.com",
        password: "12345678",
        role: "creator",
        workspace: "creator",
        plan: "free"
      },
      {
        fullname: "Business Test",
        email: "business@test.com",
        password: "12345678",
        role: "business",
        workspace: "business",
        plan: "free"
      },
      {
        fullname: "Agency Test",
        email: "agency@test.com",
        password: "12345678",
        role: "business",
        workspace: "agency",
        plan: "free"
      }
    ];

    for (const account of testAccounts) {
      let user = await User.findOne({ email: account.email });

      if (user) {
        console.log(`User ${account.email} already exists. Checking profile & demo data...`);
      } else {
        const hashedPassword = await bcrypt.hash(account.password, 12);
        user = await User.create({
          fullname: account.fullname,
          email: account.email,
          password: hashedPassword,
          role: account.role,
          workspace: account.workspace,
          plan: account.plan,
          onboardingCompleted: true,
          agencyOnboardingCompleted: account.workspace === 'agency' ? true : false,
          planSelected: false,
          trialStartDate: now,
          trialEndsAt: trialEndsAt,
        });
        console.log(`Created user ${account.email}`);
      }

      // Create Creator Profile and Demo Data
      if (account.workspace === "creator") {
        await CreatorProfile.findOneAndUpdate(
          { user: user._id },
          {
            niche: "Technology",
            language: "English",
            platform: "YouTube, Instagram",
            tone: "Educational and Professional",
            goal: "Personal Brand",
            bio: "Tech enthusiast simplifying software engineering for everyone.",
            website: "https://creatortest.tech",
            keywords: ["programming", "web development", "AI", "productivity"]
          },
          { upsert: true, new: true }
        );
        console.log(`Updated CreatorProfile for ${account.email}`);

        const gcCount = await GeneratedContent.countDocuments({ user: user._id });
        if (gcCount === 0) {
          await GeneratedContent.insertMany([
            { user: user._id, type: "hook", prompt: "Tech career advice", output: "Stop scrolling if you want to become a senior developer in 2026. Here's a 3-step roadmap.", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000 * 2) },
            { user: user._id, type: "script", prompt: "AI tools for devs", output: "Intro: Welcome back to the channel. Today we're looking at the top 3 AI coding assistants...", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000) },
            { user: user._id, type: "caption", prompt: "Desk setup tour", output: "My 2026 coding sanctuary. 🚀 Check out the full build on my YouTube channel. Drop your desk must-haves in the comments below! 👇 #DeskSetup #Coding #Tech", contentStatus: "draft", createdAt: new Date() }
          ]);
          
          await SavedContent.insertMany([
            { user: user._id, ownerType: "creator", title: "Tech Career Hook", type: "hook", content: "Stop scrolling if you want to become a senior developer in 2026. Here's a 3-step roadmap.", pipelineStage: "ideation" },
            { user: user._id, ownerType: "creator", title: "Desk Setup Caption", type: "caption", content: "My 2026 coding sanctuary. 🚀 Check out the full build on my YouTube channel. Drop your desk must-haves in the comments below! 👇 #DeskSetup #Coding #Tech", pipelineStage: "published", contentStatus: "published" }
          ]);
          console.log(`Seeded Creator demo data for ${account.email}`);
        }
      }

      // Create Business Profile and Demo Data
      else if (account.workspace === "business") {
        await BusinessProfile.findOneAndUpdate(
          { user: user._id },
          {
            businessName: "SaaS Startup Solutions",
            businessType: "Software as a Service",
            city: "San Francisco",
            goal: "Lead Generation",
            services: ["B2B Automation", "CRM Integration"],
            products: ["AutomationPro", "CRM Connector"],
            targetCustomers: "Mid-size B2B companies",
            onlinePresence: "LinkedIn, Instagram",
            workingHours: "9 AM - 6 PM",
            contactEmail: "contact@saasstartup.com",
            brandVoiceTone: "Professional",
            description: "We help mid-size businesses scale through AI automation and seamless CRM integrations.",
            marketingBudget: "$5,000/mo"
          },
          { upsert: true, new: true }
        );
        console.log(`Updated BusinessProfile for ${account.email}`);

        const gcCount = await GeneratedContent.countDocuments({ user: user._id });
        if (gcCount === 0) {
          await GeneratedContent.insertMany([
            { user: user._id, type: "ad-copy", prompt: "LinkedIn ad for CRM integration", output: "Struggling to keep your sales data synced? Discover how AutomationPro seamlessly connects your favorite tools to save 20 hours a week.", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000 * 3) },
            { user: user._id, type: "local-seo", prompt: "Blog on B2B Automation", output: "<h1>The Future of B2B Automation in SF</h1><p>San Francisco businesses are rapidly adopting CRM integrations...</p>", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000 * 2) },
            { user: user._id, type: "business-post", prompt: "Content idea about productivity", output: "Top 5 ways automation boosts team productivity. 1. Eliminate data entry...", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000) },
            { user: user._id, type: "business-caption", prompt: "Team lunch post", output: "Celebrating a massive Q1 with the best team in SF! 🍕🎉 Grateful for our amazing engineers and sales rockstars. #TeamCulture #SaaS", contentStatus: "draft", createdAt: new Date() }
          ]);
          console.log(`Seeded Business demo data for ${account.email}`);
        }
      }

      // Create Agency Profile and Demo Data
      else if (account.workspace === "agency") {
        await AgencyProfile.findOneAndUpdate(
          { agencyId: user._id },
          {
            agencyName: "Nexus Digital Agency",
            teamSize: "10-50",
            primaryColor: "#7c3aed",
            secondaryColor: "#c4b5fd",
            timezone: "America/New_York",
            city: "New York",
            country: "USA",
            description: "A full-service digital agency focused on growth marketing and branding for modern tech companies.",
            services: ["SEO", "Content Marketing", "PPC Campaigns"],
            projects: "25 Active Projects"
          },
          { upsert: true, new: true }
        );
        console.log(`Updated AgencyProfile for ${account.email}`);

        const clientCount = await AgencyClient.countDocuments({ agencyId: user._id });
        if (clientCount === 0) {
          const client1 = await AgencyClient.create({ agencyId: user._id, name: "TechFlow Solutions", email: "contact@techflow.com", clientType: "business", status: "active", industry: "SaaS", city: "Austin", country: "USA" });
          const client2 = await AgencyClient.create({ agencyId: user._id, name: "Emma's Bakery", email: "hello@emmasbakery.com", clientType: "business", status: "active", industry: "Food & Beverage", city: "New York", country: "USA" });
          const client3 = await AgencyClient.create({ agencyId: user._id, name: "Fitness with Jake", email: "jake@fitness.com", clientType: "creator", status: "lead", niche: "Health & Fitness", audienceSize: "100k" });

          await AgencyTask.insertMany([
            { agencyId: user._id, clientId: client1._id, title: "Q3 LinkedIn Campaign Strategy", status: "in-progress", priority: "high", createdBy: user._id },
            { agencyId: user._id, clientId: client2._id, title: "Local SEO Audit", status: "todo", priority: "medium", createdBy: user._id },
            { agencyId: user._id, clientId: client3._id, title: "Draft YouTube Script", status: "completed", priority: "low", createdBy: user._id }
          ]);

          await GeneratedContent.insertMany([
            { user: user._id, agencyId: user._id, clientId: client1._id, type: "ad-copy", prompt: "TechFlow LinkedIn Ad", output: "Boost your team's workflow with TechFlow...", contentStatus: "draft", createdAt: new Date() },
            { user: user._id, agencyId: user._id, clientId: client2._id, type: "local-seo", prompt: "Bakery SEO Keywords", output: "Best bakery in NYC, custom cakes New York...", contentStatus: "draft", createdAt: new Date(Date.now() - 86400000) }
          ]);
          console.log(`Seeded Agency demo data for ${account.email}`);
        }
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedUsers();
