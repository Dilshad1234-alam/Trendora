const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/app/api/agency/branding/route.js",
  "src/app/api/agency/bulk-generate/route.js",
  "src/app/api/agency/clients/route.js",
  "src/app/api/agency/dashboard/route.js",
  "src/app/api/agency/pipeline/route.js",
  "src/app/api/agency/reports/route.js",
  "src/app/api/agency/saved/route.js",
  "src/app/api/agency/team/route.js"
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join("d:/Users/mddil/Desktop/Next.js/trendora", relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/import\s+{\s*checkAgencyAccess\s*}\s+from\s+"@\/lib\/auth-helpers";/g, 'import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";');
    content = content.replace(/checkAgencyAccess\(\)/g, 'getAuthenticatedAgency()');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log("Updated", relPath);
  }
}
