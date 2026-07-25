const fs = require('fs');
const path = require('path');

const apiSrc = path.join(__dirname, '../src/app/api/ai/business');
const apiDest = path.join(__dirname, '../src/app/api/ai/business-pro');

const pageSrc = path.join(__dirname, '../src/app/business');
const pageDest = path.join(__dirname, '../src/app/business-pro');

// 1. Copy and modify API routes
const apiDirs = ['ad-copy', 'caption', 'hashtag', 'local-seo', 'post', 'review-reply', 'whatsapp-reply'];

fs.mkdirSync(apiDest, { recursive: true });

apiDirs.forEach(dir => {
  const srcFile = path.join(apiSrc, dir, 'route.js');
  const destDir = path.join(apiDest, dir);
  const destFile = path.join(destDir, 'route.js');
  
  if (fs.existsSync(srcFile)) {
    fs.mkdirSync(destDir, { recursive: true });
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace role check with plan check
    content = content.replace(
      /if\s*\(\s*user\.role\s*!==\s*["']business["']\s*\)\s*\{\s*return\s*\{\s*error:\s*["']Only business users can use this tool\.["'],\s*status:\s*403,\s*\};\s*\}/,
      `if (user.plan !== "business-pro") { return { error: "Only Business Pro users can use this tool.", status: 403 }; }`
    );
    
    // Remove daily limit checks
    content = content.replace(/const\s+FREE_DAILY_[A_Z_]+\s*=\s*\d+;/g, '');
    
    content = content.replace(/if\s*\(\s*user\.plan\s*===\s*["']free["'].*?\}\s*\}/s, (match) => {
      // replace the block that checks for free limit and returns 403
      return '';
    });
    
    // Remove limits from the GET handler as well if they exist
    content = content.replace(/if\s*\(\s*user\.plan\s*===\s*["']free["']\s*&&\s*[a-zA-Z0-9_]+\s*>=\s*FREE_DAILY_[A_Z_]+\s*\)\s*\{\s*return\s*NextResponse\.json\([\s\S]*?status:\s*403[\s\S]*?\}\s*\);?\s*\}/, '');

    fs.writeFileSync(destFile, content);
  }
});

// 2. Copy and modify Frontend Pages
const pageDirs = [
  'ad-copy-generator', 'caption-generator', 'hashtag-generator', 
  'local-seo-generator', 'post-generator', 'review-reply-generator', 
  'whatsapp-reply-generator', 'dashboard', 'saved'
];

fs.mkdirSync(pageDest, { recursive: true });

pageDirs.forEach(dir => {
  const srcFile = path.join(pageSrc, dir, 'page.js');
  const destDir = path.join(pageDest, dir);
  const destFile = path.join(destDir, 'page.js');
  
  if (fs.existsSync(srcFile)) {
    fs.mkdirSync(destDir, { recursive: true });
    let content = fs.readFileSync(srcFile, 'utf8');
    
    // Replace business-ai.api imports with business-pro.api
    content = content.replace(/@\/services\/business-ai\.api/g, '@/services/business-pro.api');
    
    // For dashboard and daily plan, replace business-daily-plan.api
    content = content.replace(/@\/services\/business-daily-plan\.api/g, '@/services/business-pro.api');

    // Replace function names like getBusinessDashboard -> getBusinessProDashboard
    content = content.replace(/getBusinessDashboard/g, 'getBusinessProDashboard');
    content = content.replace(/getBusinessDailyPlan/g, 'getBusinessProDailyPlan');
    content = content.replace(/regenerateBusinessDailyPlan/g, 'regenerateBusinessProDailyPlan');
    content = content.replace(/toggleBusinessPlanStep/g, 'toggleBusinessProPlanStep');
    content = content.replace(/updateBusinessPlanStatus/g, 'updateBusinessProPlanStatus');
    
    content = content.replace(/generateBusinessAdCopy/g, 'generateBusinessProAdCopy');
    content = content.replace(/generateBusinessCaption/g, 'generateBusinessProCaption');
    content = content.replace(/generateBusinessHashtag/g, 'generateBusinessProHashtag');
    content = content.replace(/generateBusinessLocalSeo/g, 'generateBusinessProLocalSeo');
    content = content.replace(/generateBusinessPost/g, 'generateBusinessProPost');
    content = content.replace(/generateBusinessReviewReply/g, 'generateBusinessProReviewReply');
    content = content.replace(/generateBusinessWhatsappReply/g, 'generateBusinessProWhatsappReply');

    // Make theme Amber/Orange
    // Free business uses blue/indigo usually, we change to amber
    content = content.replace(/from-blue-/g, 'from-amber-');
    content = content.replace(/to-indigo-/g, 'to-orange-');
    content = content.replace(/text-blue-/g, 'text-amber-');
    content = content.replace(/bg-blue-/g, 'bg-amber-');
    content = content.replace(/border-blue-/g, 'border-amber-');
    content = content.replace(/hover:bg-blue-/g, 'hover:bg-amber-');
    content = content.replace(/ring-blue-/g, 'ring-amber-');
    
    content = content.replace(/from-indigo-/g, 'from-orange-');
    content = content.replace(/to-blue-/g, 'to-amber-');
    content = content.replace(/text-indigo-/g, 'text-orange-');
    content = content.replace(/bg-indigo-/g, 'bg-orange-');
    content = content.replace(/border-indigo-/g, 'border-orange-');

    // Fix hrefs in the sidebar/navigation
    content = content.replace(/"\/business\//g, '"/business-pro/');
    content = content.replace(/'\/business\//g, "'/business-pro/");

    fs.writeFileSync(destFile, content);
  }
});

console.log("Successfully generated business-pro routes and pages!");
