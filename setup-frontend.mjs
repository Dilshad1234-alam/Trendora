import fs from "fs";
import path from "path";

const rootDir = path.join(process.cwd(), "src/app");
const srcDir = path.join(rootDir, "business");
const destDir = path.join(rootDir, "business-pro");

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const pages = [
  "dashboard/page.js",
  "saved/page.js",
  "ad-copy-generator/page.js",
  "caption-generator/page.js",
  "hashtag-generator/page.js",
  "local-seo-generator/page.js",
  "post-generator/page.js",
  "review-reply-generator/page.js",
  "whatsapp-reply-generator/page.js"
];

for (const page of pages) {
  const srcFile = path.join(srcDir, page);
  const destFile = path.join(destDir, page);

  if (fs.existsSync(srcFile)) {
    const destDirPath = path.dirname(destFile);
    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    let content = fs.readFileSync(srcFile, "utf-8");

    content = content.replaceAll("business/", "business-pro/");
    content = content.replaceAll('"/business"', '"/business-pro"');
    content = content.replaceAll("BusinessDashboard", "BusinessProDashboard");
    content = content.replaceAll("BusinessSaved", "BusinessProSaved");
    content = content.replaceAll("violet", "amber");
    content = content.replaceAll("indigo", "orange");
    content = content.replaceAll("blue", "yellow");
    content = content.replaceAll("bg-amber-700", "bg-amber-600");

    content = content.replaceAll("@/services/business-ai.api", "@/services/business-pro.api");
    content = content.replaceAll("@/services/business-daily-plan.api", "@/services/business-pro.api");
    content = content.replaceAll("generateBusinessAdCopy", "generateBusinessProAdCopy");
    content = content.replaceAll("generateBusinessCaption", "generateBusinessProCaption");
    content = content.replaceAll("generateBusinessHashtag", "generateBusinessProHashtag");
    content = content.replaceAll("generateBusinessLocalSeo", "generateBusinessProLocalSeo");
    content = content.replaceAll("generateBusinessPost", "generateBusinessProPost");
    content = content.replaceAll("generateBusinessReviewReply", "generateBusinessProReviewReply");
    content = content.replaceAll("generateBusinessWhatsappReply", "generateBusinessProWhatsappReply");
    
    content = content.replaceAll("getBusinessDailyPlan", "getBusinessProDailyPlan");
    content = content.replaceAll("regenerateBusinessDailyPlan", "regenerateBusinessProDailyPlan");
    content = content.replaceAll("toggleBusinessPlanStep", "toggleBusinessProPlanStep");
    content = content.replaceAll("updateBusinessPlanStatus", "updateBusinessProPlanStatus");
    content = content.replaceAll("getBusinessDashboard", "getBusinessProDashboard");

    content = content.replaceAll("user?.plan === \"free\"", "user?.plan !== \"business-pro\"");
    content = content.replace(/currentUser\.plan ===\s*"business-pro"/g, 'currentUser.plan === "business"');
    content = content.replaceAll('router.replace("/business-pro/dashboard")', 'router.replace("/business/dashboard")');

    fs.writeFileSync(destFile, content);
    console.log(`Created ${page}`);
  }
}
console.log("Done generating all 9 frontend pages!");
