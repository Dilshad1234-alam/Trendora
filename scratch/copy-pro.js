const fs = require('fs');
const path = require('path');

const baseDir = 'd:/Users/mddil/Desktop/Next.js/trendora/src';

const apiCreatorDir = path.join(baseDir, 'app/api/ai/creator');
const apiCreatorProDir = path.join(baseDir, 'app/api/ai/creator-pro');

const appCreatorDir = path.join(baseDir, 'app/creator');
const appCreatorProDir = path.join(baseDir, 'app/creator-pro');

function copyDirWithReplacements(src, dest, type) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirWithReplacements(srcPath, destPath, type);
        } else {
            let content = fs.readFileSync(srcPath, 'utf8');
            
            if (type === 'api') {
                // Remove FREE_DAILY_CREATOR_LIMIT logic and upgrade it to creator-pro validation
                content = content.replace(/if \(user\.role !== "creator"\) \{[\s\S]*?status: 403 \}\s*\);[\s\S]*?\}/, 
`if (user.plan !== "creator-pro") {
      return NextResponse.json(
        {
          success: false,
          message: "Only Pro creators can use this generator.",
        },
        { status: 403 }
      );
    }`);
                // Strip the limit blocks
                content = content.replace(/const FREE_DAILY_CREATOR_LIMIT[\s\S]*?remainingFreeGenerations = FREE_DAILY_CREATOR_LIMIT - generationsToday - 1;\s*\}/, 
`const isFreeAccess = false;
    const remainingFreeGenerations = null;
    const FREE_DAILY_CREATOR_LIMIT = null;`);
            } else if (type === 'app') {
                // Frontend modifications
                content = content.replace(/\/creator\//g, '/creator-pro/');
                content = content.replace(/href="\/creator-pro\/dashboard"/g, 'href="/creator-pro/dashboard"');
                
                content = content.replace(/text-violet-/g, 'text-amber-');
                content = content.replace(/bg-violet-/g, 'bg-amber-');
                content = content.replace(/border-violet-/g, 'border-amber-');
                content = content.replace(/from-violet-/g, 'from-amber-');
                content = content.replace(/hover:bg-violet-/g, 'hover:bg-amber-');
                content = content.replace(/hover:text-violet-/g, 'hover:text-amber-');
                content = content.replace(/hover:border-violet-/g, 'hover:border-amber-');
                content = content.replace(/ring-violet-/g, 'ring-amber-');
                
                content = content.replace(/@\/services\/ai\.api/g, '@/services/ai-pro.api');
                
                // Add Crown icon instead of Flame/FileText in some headers, or just leave it.
                content = content.replace(/isFreeAccess = !user\?\.planSelected \|\| user\?\.plan === "free"/g, 'isFreeAccess = false');
                content = content.replace(/dailyLimitReached = isFreeAccess && remainingFreeGenerations === 0;/g, 'dailyLimitReached = false;');
                
                // Update specific text
                content = content.replace(/AI (Hook|Script|Caption|Hashtag|Thumbnail|Video) Generator/i, 'Pro $1 Generator');
            }
            
            fs.writeFileSync(destPath, content, 'utf8');
        }
    }
}

// Copy AI backend routes (skipping ones that don't exist, though all 6 should)
copyDirWithReplacements(apiCreatorDir, apiCreatorProDir, 'api');

// Copy frontend routes (skipping dashboard since it's already done)
const frontendDirs = [
    'hook-generator', 'script-generator', 'caption-generator', 
    'hashtag-generator', 'thumbnail-title-generator', 
    'video-description-generator', 'saved'
];

for (const dir of frontendDirs) {
    const srcPath = path.join(appCreatorDir, dir);
    const destPath = path.join(appCreatorProDir, dir);
    if (fs.existsSync(srcPath)) {
        copyDirWithReplacements(srcPath, destPath, 'app');
    }
}

console.log("Copied and transformed successfully.");
