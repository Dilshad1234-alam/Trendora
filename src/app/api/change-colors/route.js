import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "src/app/business-pro");

    const getFiles = (dirPath) => {
      let results = [];
      const list = fs.readdirSync(dirPath);
      for (const file of list) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(fullPath));
        } else if (file.endsWith(".js")) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const files = getFiles(dir);
    const updatedFiles = [];

    for (const file of files) {
      let content = fs.readFileSync(file, "utf-8");
      
      const before = content;
      
      // Replace amber, orange, yellow with businessPro
      content = content.replace(/amber/g, "businessPro");
      content = content.replace(/orange/g, "businessPro");
      content = content.replace(/yellow/g, "businessPro");
      
      // Replace violet, indigo, blue with businessPro (in case they already ran it)
      content = content.replace(/violet/g, "businessPro");
      content = content.replace(/indigo/g, "businessPro");
      content = content.replace(/blue/g, "businessPro");
      
      if (before !== content) {
        fs.writeFileSync(file, content);
        updatedFiles.push(file.replace(process.cwd(), ""));
      }
    }

    return NextResponse.json({ success: true, message: "Colors updated to #5D0EC0 (businessPro)!", updatedFiles });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
