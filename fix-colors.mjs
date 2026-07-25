import fs from "fs";
import path from "path";

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

for (const file of files) {
  let content = fs.readFileSync(file, "utf-8");
  content = content.replace(/amber/g, "violet");
  content = content.replace(/orange/g, "indigo");
  content = content.replace(/yellow/g, "blue");
  fs.writeFileSync(file, content);
  console.log(`Updated colors in ${file}`);
}
console.log("Color replacement complete.");
