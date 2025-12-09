import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ProjectModel from "@/lib/models/project";
import { recalculateProjectAmounts } from "@/lib/utils/projectCalculations";
import jwt from "jsonwebtoken";

// GET - Get all projects for the authenticated user
export async function GET(request: NextRequest) {
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

      const projects = await ProjectModel.find({ userId: decoded.id }).sort({
        createdAt: -1,
      });

      // Recalculate amounts for all projects to ensure they're up to date with expenses/disputes
      // Note: This could be optimized to only recalculate when needed, but ensures accuracy
      for (const project of projects) {
        try {
          await recalculateProjectAmounts(project._id.toString());
        } catch (error) {
          console.error(`Error recalculating project ${project._id}:`, error);
          // Continue with other projects even if one fails
        }
      }
      
      // Reload projects with updated calculations
      const updatedProjects = await ProjectModel.find({ userId: decoded.id }).sort({
        createdAt: -1,
      });

      return NextResponse.json({ projects: updatedProjects });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_PROJECTS_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching projects" },
      { status: 500 }
    );
  }
}

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Debug: Log all cookies
    const allCookies = request.cookies.getAll();
    console.log("All cookies received:", allCookies.map(c => c.name));
    
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      console.error("No auth-token cookie found. Available cookies:", allCookies.map(c => c.name));
      return NextResponse.json(
        { error: "Not authenticated - no token found" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production"
      ) as { id: string };
      
      console.log("Token verified successfully for user:", decoded.id);

      let body;
      try {
        body = await request.json();
        console.log("Request body parsed successfully");
        console.log("includeCharity in body:", body.includeCharity, typeof body.includeCharity);
      } catch (parseError: any) {
        console.error("Error parsing request body:", parseError);
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      try {
        await connectToDatabase();
        console.log("Database connected successfully");
      } catch (dbError: any) {
        console.error("Database connection error:", dbError);
        return NextResponse.json(
          { error: "Database connection failed", details: dbError.message },
          { status: 500 }
        );
      }

      try {
        // Create project - calculations will be done in pre-save hook
        // Explicitly set includeCharity to ensure it's saved
        const projectData: any = {
          projectTitle: body.projectTitle,
          projectPrice: body.projectPrice,
          priceType: body.priceType,
          platformFeePercentage: body.platformFeePercentage,
          platformName: body.platformName,
          projectStartDate: body.projectStartDate,
          projectEndDate: body.projectEndDate,
          status: body.status,
          userId: decoded.id,
          partners: body.partners || [],
          includeCharity: body.includeCharity !== undefined ? Boolean(body.includeCharity) : false,
        };
        
        console.log("Project data to save:", {
          includeCharity: projectData.includeCharity,
          type: typeof projectData.includeCharity,
          rawValue: body.includeCharity,
        });
        
        const project = new ProjectModel(projectData);
        
        console.log("Project model created, includeCharity:", project.includeCharity);

        console.log("Project model created, saving...");
        console.log("Before save - includeCharity:", project.includeCharity);
        await project.save();
        console.log("Project saved successfully with ID:", project._id);
        console.log("After save - includeCharity:", project.includeCharity);
        
        // Recalculate amounts including expenses and disputes
        await recalculateProjectAmounts(project._id.toString());
        
        // Reload to get calculated fields
        const savedProject = await ProjectModel.findById(project._id);
        console.log("Project reloaded with calculated fields");
        console.log("Reloaded project - includeCharity:", savedProject?.includeCharity);

        return NextResponse.json(
          { project: savedProject, message: "Project created successfully" },
          { status: 201 }
        );
      } catch (saveError: any) {
        console.error("Error saving project:", saveError);
        console.error("Error details:", {
          message: saveError.message,
          name: saveError.name,
          stack: saveError.stack,
        });
        return NextResponse.json(
          { error: "Failed to create project", details: saveError.message },
          { status: 500 }
        );
      }
    } catch (jwtError: any) {
      console.error("JWT verification error:", jwtError);
      console.error("JWT error details:", {
        message: jwtError.message,
        name: jwtError.name,
        stack: jwtError.stack,
      });
      return NextResponse.json(
        { error: "Invalid or expired token", details: jwtError.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("CREATE_PROJECT_ERROR - Outer catch:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json(
      { error: "An error occurred while creating project", details: error.message },
      { status: 500 }
    );
  }
}

