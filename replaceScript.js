const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/app/api/agency');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('getAuthenticatedAgency')) {
    let newContent = content.replace(/import \{ getAuthenticatedAgency \} from "@\/lib\/auth\/getAuthenticatedAgency";/g, 'import { agencyAccess } from "@/lib/agencyAccess";');
    newContent = newContent.replace(/getAuthenticatedAgency\(\)/g, 'agencyAccess()');
    
    // Also, some files might use `auth.error` and `auth.status`. I should make sure `auth.code` and `auth.redirectTo` are handled if we want to return them.
    // The existing error handler usually looks like: 
    // if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    // Let's replace it with:
    // if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });
    
    newContent = newContent.replace(
      /if \(auth\.error\) return NextResponse\.json\(\{ error: auth\.error \}, \{ status: auth\.status \}\);/g,
      'if (auth.error) return NextResponse.json({ error: auth.error, code: auth.code, redirectTo: auth.redirectTo }, { status: auth.status });'
    );
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDirectory(directoryPath);
console.log('Done!');
