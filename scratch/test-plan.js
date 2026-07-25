const mongoose = require("mongoose");
const BusinessDailyPlan = require("./src/models/BusinessDailyPlan").default;

const testPlan = new BusinessDailyPlan({
  user: new mongoose.Types.ObjectId(),
  dateKey: "2026-07-25",
  businessGoal: "Increase local visibility",
  topic: "Promote Service",
  platform: "Instagram",
  contentType: "Business promotion post",
  offerIdea: "Highlight one clear customer benefit",
  targetCustomer: "Local customers",
  cta: "Message us today",
  actionSteps: [
    { text: "Step 1" },
    { text: "Step 2" },
    { text: "Step 3" },
    { text: "Step 4" },
    { text: "Step 5" },
    { text: "Step 6" },
    { text: "Step 7" }
  ],
  postingTime: "7:00 PM",
  aiTip: "Focus on one benefit",
  estimatedTime: "45 mins",
  difficulty: "easy",
  source: "fallback"
});

const error = testPlan.validateSync();
if (error) {
  console.log("Validation failed:");
  console.log(error.message);
  for (let field in error.errors) {
    console.log(`- ${field}: ${error.errors[field].message}`);
  }
} else {
  console.log("Validation passed successfully.");
}
