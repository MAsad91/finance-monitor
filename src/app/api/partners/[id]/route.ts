import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PartnerModel from "@/lib/models/partner";
import jwt from "jsonwebtoken";

// GET - Get a single partner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      const partner = await PartnerModel.findOne({
        _id: id,
        userId: decoded.id,
      });

      if (!partner) {
        return NextResponse.json(
          { error: "Partner not found" },
          { status: 404 }
        );
      }

      // Convert Mongoose document to plain object
      const partnerObj = partner.toJSON();

      return NextResponse.json({ partner: partnerObj });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_PARTNER_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching partner" },
      { status: 500 }
    );
  }
}

// PUT - Update a partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      await connectToDatabase();

      const partner = await PartnerModel.findOneAndUpdate(
        { _id: id, userId: decoded.id },
        { ...body, updatedAt: new Date() },
        { new: true }
      );

      if (!partner) {
        return NextResponse.json(
          { error: "Partner not found" },
          { status: 404 }
        );
      }

      // Convert Mongoose document to plain object
      const partnerObj = partner.toJSON();

      return NextResponse.json({
        partner: partnerObj,
        message: "Partner updated successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("UPDATE_PARTNER_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while updating partner" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

      const partner = await PartnerModel.findOneAndDelete({
        _id: id,
        userId: decoded.id,
      });

      if (!partner) {
        return NextResponse.json(
          { error: "Partner not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Partner deleted successfully",
      });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("DELETE_PARTNER_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while deleting partner" },
      { status: 500 }
    );
  }
}

