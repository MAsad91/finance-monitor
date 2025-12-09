import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectModel from "@/lib/models/project";
import { recalculateProjectAmounts } from "@/lib/utils/projectCalculations";
import jwt from "jsonwebtoken";

// GET - Get a single project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };

      await connectToDatabase();

      const project = await ProjectModel.findOne({
        _id: id,
        userId: decoded.id,
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      // Recalculate amounts to ensure they're up to date with expenses and disputes
      await recalculateProjectAmounts(id);
      const updatedProject = await ProjectModel.findById(id);

      return NextResponse.json({ project: updatedProject });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_PROJECT_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching project" },
      { status: 500 }
    );
  }
}

// PATCH - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };

      const body = await request.json();
      
      console.log("PATCH Update request body:", body);
      console.log("includeCharity in body:", body.includeCharity, typeof body.includeCharity);

      await connectToDatabase();

      // Build update object with $set operator
      const updateData: any = {
        $set: {
          projectTitle: body.projectTitle,
          projectPrice: body.projectPrice,
          priceType: body.priceType,
          platformFeePercentage: body.platformFeePercentage,
          platformName: body.platformName,
          projectStartDate: body.projectStartDate,
          projectEndDate: body.projectEndDate,
          status: body.status,
          updatedAt: new Date(),
        }
      };

      // Explicitly handle includeCharity - always include it if provided
      if (body.includeCharity !== undefined) {
        updateData.$set.includeCharity = Boolean(body.includeCharity);
        console.log("Setting includeCharity in $set:", updateData.$set.includeCharity, typeof updateData.$set.includeCharity);
      }

      // Preserve partners if provided
      if (body.partners !== undefined) {
        updateData.$set.partners = body.partners;
      }

      console.log("Update data with $set:", JSON.stringify(updateData, null, 2));

      // Use findOneAndUpdate with $set operator
      const project = await ProjectModel.findOneAndUpdate(
        { _id: id, userId: decoded.id },
        updateData,
        { 
          new: true, 
          runValidators: true,
          setDefaultsOnInsert: true // Ensure defaults are set if field doesn't exist
        }
      );

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      console.log("After findOneAndUpdate - project.includeCharity:", project.includeCharity);
      console.log("After findOneAndUpdate - project.toObject().includeCharity:", project.toObject().includeCharity);

      // Save to trigger pre-save hook for calculations
      await project.save();
      console.log("After save - project.includeCharity:", project.includeCharity);
      
      // Recalculate amounts including expenses and disputes
      await recalculateProjectAmounts(id);
      
      // Reload to get calculated fields
      const updatedProject = await ProjectModel.findById(project._id);
      console.log("Reloaded project - includeCharity:", updatedProject?.includeCharity);

      return NextResponse.json({
        project: updatedProject,
        message: "Project updated successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("UPDATE_PROJECT_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while updating project" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };

      await connectToDatabase();

      const project = await ProjectModel.findOneAndDelete({
        _id: id,
        userId: decoded.id,
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Project deleted successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("DELETE_PROJECT_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while deleting project" },
      { status: 500 }
    );
  }
}

