const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "../src/app/api/creator/daily-plan/route.js");
const targetDir = path.join(__dirname, "../src/app/api/creator-pro/daily-plan");
const targetPath = path.join(targetDir, "route.js");

fs.mkdirSync(targetDir, { recursive: true });

let content = fs.readFileSync(sourcePath, "utf8");

// Modify the logic
// 1. Remove the plan check for free
// Change getAuthenticatedCreator to enforce creator-pro
content = content.replace(
  `  if (user.role !== "creator") {`,
  `  if (user.plan !== "creator-pro") {
    return {
      error: "Only Creator Pro users can access this.",
      status: 403,
    };
  }

  if (user.role !== "creator") {`
);

// 2. Remove the regeneration count limit for free users (though the plan will be creator-pro anyway)
content = content.replace(
  `    if (
      auth.user.plan === "free" &&
      currentPlan.regenerationCount >= 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Free Plan allows one daily-plan regeneration per day.",
        },
        { status: 403 }
      );
    }`,
  ``
);

fs.writeFileSync(targetPath, content);
console.log("Successfully copied and updated creator-pro daily-plan route.");
