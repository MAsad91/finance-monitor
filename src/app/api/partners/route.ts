import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PartnerModel from "@/lib/models/partner";
import jwt from "jsonwebtoken";

// GET - Get all partners for the authenticated user
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

      const partners = await PartnerModel.find({ userId: decoded.id }).sort({
        createdAt: -1,
      });

      // Convert Mongoose documents to plain objects
      const partnersArray = partners.map((partner) => partner.toJSON());

      return NextResponse.json({ partners: partnersArray });
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("GET_PARTNERS_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while fetching partners" },
      { status: 500 }
    );
  }
}

// POST - Create a new partner
export async function POST(request: NextRequest) {
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

      await connectToDatabase();

      const partner = new PartnerModel({
        ...body,
        userId: decoded.id,
      });

      await partner.save();

      // Convert Mongoose document to plain object using toJSON (which includes virtuals)
      const partnerObj: any = partner.toJSON();
      
      // Ensure id field is present
      if (!partnerObj.id && partner._id) {
        partnerObj.id = partner._id.toHexString();
      }

      return NextResponse.json(
        { partner: partnerObj, message: "Partner created successfully" },
        { status: 201 }
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("CREATE_PARTNER_ERROR", error);
    return NextResponse.json(
      { error: "An error occurred while creating partner" },
      { status: 500 }
    );
  }
}

