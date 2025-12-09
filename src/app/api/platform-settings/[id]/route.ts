import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectSettingsModel from "@/lib/models/projectSettings";
import { ensureWellKnownPlatforms } from "@/lib/utils/seedPlatformSettings";
import jwt from "jsonwebtoken";

// DELETE - Delete a custom platform setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Ensure well-known platforms exist
    await ensureWellKnownPlatforms();

    // Check if it's a well-known platform (cannot be deleted)
    const setting = await ProjectSettingsModel.findById(id);
    if (setting && (setting.userId === "system" || !setting.isCustom)) {
      return NextResponse.json(
        { error: "Cannot delete well-known platform settings" },
        { status: 400 }
      );
    }

    // Find and delete the setting (only if it's a custom platform owned by the user)
    const settingToDelete = await ProjectSettingsModel.findOneAndDelete({
      _id: id,
      userId,
      isCustom: true, // Only allow deletion of custom platforms
    });

    if (!settingToDelete) {
      return NextResponse.json(
        { error: "Platform setting not found or cannot be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Platform setting deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting platform settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete platform settings" },
      { status: 500 }
    );
  }
}

