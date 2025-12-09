import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectSettingsModel from "@/lib/models/projectSettings";
import { ensureWellKnownPlatforms } from "@/lib/utils/seedPlatformSettings";
import jwt from "jsonwebtoken";

// GET - Fetch all platform settings for the user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };
      userId = decoded.id;
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectToDatabase();

    // Ensure well-known platforms exist in database
    await ensureWellKnownPlatforms();

    // Get well-known platforms (system-level, not custom)
    const wellKnownSettings = await ProjectSettingsModel.find({
      userId: "system",
      isCustom: false,
    })
      .sort({ platformName: 1 });

    // Get user's custom settings
    const customSettings = await ProjectSettingsModel.find({ userId })
      .sort({ platformName: 1 });

    // Convert to JSON to include virtual id field
    const wellKnownJson = wellKnownSettings.map((s) => s.toJSON());
    const customJson = customSettings.map((s) => s.toJSON());

    // Combine and return - return the array directly to match apiClient expectations
    return NextResponse.json([...wellKnownJson, ...customJson]);
  } catch (error: any) {
    console.error("Error fetching platform settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch platform settings" },
      { status: 500 }
    );
  }
}

// POST - Create or update platform settings
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };
      userId = decoded.id;
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const { platformName, platformFeePercentage, withdrawalFees, isCustom } = body;

    if (!platformName || platformFeePercentage === undefined) {
      return NextResponse.json(
        { error: "Platform name and fee percentage are required" },
        { status: 400 }
      );
    }

    // Check if it's a well-known platform (cannot be modified)
    await ensureWellKnownPlatforms();
    const existingWellKnown = await ProjectSettingsModel.findOne({
      platformName: platformName.trim(),
      userId: "system",
      isCustom: false,
    });

    if (existingWellKnown && !isCustom) {
      return NextResponse.json(
        { error: "Cannot modify well-known platform settings. Create a custom platform instead." },
        { status: 400 }
      );
    }

    // Find existing setting or create new
    const existing = await ProjectSettingsModel.findOne({
      userId,
      platformName: platformName.trim(),
    });

    let setting;
    if (existing) {
      // Update existing
      existing.platformFeePercentage = platformFeePercentage;
      existing.withdrawalFees = withdrawalFees || {};
      existing.isCustom = isCustom !== undefined ? isCustom : true;
      await existing.save();
      setting = existing;
    } else {
      // Create new
      setting = await ProjectSettingsModel.create({
        platformName: platformName.trim(),
        platformFeePercentage,
        withdrawalFees: withdrawalFees || {},
        isCustom: isCustom !== undefined ? isCustom : true,
        userId,
      });
    }

    // Return the setting data directly to match apiClient expectations
    return NextResponse.json(setting.toJSON(), { status: existing ? 200 : 201 });
  } catch (error: any) {
    console.error("Error creating/updating platform settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save platform settings" },
      { status: 500 }
    );
  }
}

