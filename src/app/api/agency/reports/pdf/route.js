import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import SavedContent from "@/models/SavedContent";
import AgencyClient from "@/models/AgencyClient";
import { getAuthenticatedAgency } from "@/lib/auth/getAuthenticatedAgency";
import { checkAgencyPermission } from "@/lib/auth/checkAgencyPermission";
import PDFDocument from "pdfkit";

const AI_TIME_SAVED_MAP = {
  "hook": 10,
  "caption": 10,
  "creator-caption": 10,
  "business-caption": 10,
  "hashtag": 10,
  "creator-hashtag": 10,
  "business-hashtag": 10,
  "business-post": 20,
  "post": 20,
  "creator-post": 20,
  "script": 60,
  "ad-copy": 30,
  "product-description": 25,
  "local-seo": 45,
  "review-reply": 5,
  "whatsapp-reply": 5,
};

export async function GET(request) {
  try {
    await connectDB();
    const auth = await getAuthenticatedAgency();
    
    const perm = await checkAgencyPermission(auth);
    if (!perm.success) {
      return new NextResponse(perm.message, { status: perm.status });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
      return new NextResponse("A valid client ID is required.", { status: 400 });
    }

    const client = await AgencyClient.findOne({ _id: clientId, agencyId: auth.user._id });
    if (!client) {
      return new NextResponse("Client not found.", { status: 404 });
    }

    const query = { agencyId: auth.user._id, clientId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const contentList = await SavedContent.find(query).populate("assignedTo", "memberName").lean();

    let totalTimeSavedMinutes = 0;
    const contentByType = {};
    const contentByStatus = {
      "draft": 0, "internal-review": 0, "client-review": 0,
      "approved": 0, "rejected": 0, "scheduled": 0, "published": 0
    };
    const teamContribution = {};

    contentList.forEach(item => {
      const timeSaved = AI_TIME_SAVED_MAP[item.type] || 15;
      totalTimeSavedMinutes += timeSaved;

      const typeStr = item.type.replace("-", " ");
      contentByType[typeStr] = (contentByType[typeStr] || 0) + 1;

      const status = item.contentStatus || "draft";
      contentByStatus[status] = (contentByStatus[status] || 0) + 1;

      if (item.assignedTo) {
        const member = item.assignedTo.memberName;
        teamContribution[member] = (teamContribution[member] || 0) + 1;
      } else {
        teamContribution["Unassigned"] = (teamContribution["Unassigned"] || 0) + 1;
      }
    });

    const breakdown = Object.entries(contentByType).sort((a, b) => b[1] - a[1]);
    const hoursSaved = (totalTimeSavedMinutes / 60).toFixed(1);

    // Create PDF
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(
          new NextResponse(pdfData, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="Report_${client.name || client.businessName}.pdf"`,
            },
          })
        );
      });

      // Colors
      const primaryColor = "#6d28d9"; // violet-700
      const textColor = "#18181b"; // zinc-900
      const mutedColor = "#71717a"; // zinc-500
      const accentColor = "#059669"; // emerald-600

      // Header
      doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text(auth.user.name || "Agency Name", { align: "left" });
      doc.moveUp();
      doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor).text("Monthly Insights", { align: "right" });
      
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor(mutedColor).text("Client: " + (client.name || client.businessName || client.creatorName), { align: "left" });
      doc.moveUp();
      doc.fontSize(10).fillColor(mutedColor).text(
        `${startDate ? new Date(startDate).toLocaleDateString() : 'All Time'} - ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, 
        { align: "right" }
      );
      
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e4e4e7").stroke();
      doc.moveDown(1.5);

      // Executive Summary
      doc.fontSize(16).font('Helvetica-Bold').fillColor(textColor).text("Executive Summary");
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').fillColor(textColor).lineGap(4).text(
        `During this period, our automated content pipeline successfully generated ${contentList.length} unique assets precisely tuned to the client's brand voice. By utilizing advanced AI capabilities, our agency saved an estimated ${hoursSaved} hours of manual production time.`
      );
      doc.moveDown(2);

      // KPI Grid (Simulation with text)
      const kpiY = doc.y;
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(mutedColor).text("TOTAL ASSETS", 50, kpiY);
      doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor).text(contentList.length.toString(), 50, kpiY + 15);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(mutedColor).text("HOURS SAVED", 200, kpiY);
      doc.fontSize(24).font('Helvetica-Bold').fillColor(accentColor).text(`${hoursSaved}h`, 200, kpiY + 15);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(mutedColor).text("PUBLISHED", 350, kpiY);
      doc.fontSize(24).font('Helvetica-Bold').fillColor("#1d4ed8").text(contentByStatus["published"].toString(), 350, kpiY + 15);
      
      const inReview = (contentByStatus["internal-review"] || 0) + (contentByStatus["client-review"] || 0);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(mutedColor).text("IN REVIEW", 480, kpiY);
      doc.fontSize(24).font('Helvetica-Bold').fillColor("#b45309").text(inReview.toString(), 480, kpiY + 15);

      doc.moveDown(3);
      const listY = doc.y + 40;

      // Two Column Lists
      doc.fontSize(14).font('Helvetica-Bold').fillColor(textColor).text("Asset Breakdown", 50, listY);
      doc.fontSize(14).font('Helvetica-Bold').fillColor(textColor).text("Pipeline Status", 300, listY);
      
      doc.moveTo(50, listY + 20).lineTo(250, listY + 20).strokeColor("#e4e4e7").stroke();
      doc.moveTo(300, listY + 20).lineTo(545, listY + 20).strokeColor("#e4e4e7").stroke();

      let currentY = listY + 35;
      
      // Column 1: Asset Breakdown
      if (breakdown.length === 0) {
        doc.fontSize(10).font('Helvetica-Oblique').fillColor(mutedColor).text("No content generated.", 50, currentY);
      } else {
        breakdown.forEach(([name, count], index) => {
          const itemY = currentY + (index * 20);
          doc.fontSize(11).font('Helvetica').fillColor(textColor).text(name.charAt(0).toUpperCase() + name.slice(1), 50, itemY);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(count.toString(), 230, itemY, { width: 20, align: 'right' });
        });
      }

      // Column 2: Pipeline Status
      let statusIndex = 0;
      Object.entries(contentByStatus)
        .filter(([_, val]) => val > 0)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
          const itemY = currentY + (statusIndex * 20);
          doc.fontSize(11).font('Helvetica').fillColor(textColor).text(status.replace("-", " ").charAt(0).toUpperCase() + status.replace("-", " ").slice(1), 300, itemY);
          doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text(count.toString(), 525, itemY, { width: 20, align: 'right' });
          statusIndex++;
      });

      // Footer
      doc.fontSize(9).font('Helvetica-Oblique').fillColor(mutedColor).text(
        "Generated securely via Trendora Agency OS",
        50,
        780,
        { align: "center" }
      );

      doc.end();
    });

  } catch (error) {
    console.error("GET Reports PDF error:", error);
    return new NextResponse("Failed to generate PDF.", { status: 500 });
  }
}
