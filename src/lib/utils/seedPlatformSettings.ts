import { connectToDatabase } from "@/lib/db";
import ProjectSettingsModel from "@/lib/models/projectSettings";

type PlatformSettingsData = {
  platformName: string;
  platformFeePercentage: number;
  withdrawalFees: {
    platformToPayoneer?: { amount: number; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
    platformToLocalBank?: { amount: number; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
    payoneerToLocalBank?: { amount: number; currency: "inr" | "dollars" | "euro" | "pkr" | "gbp" | "cad" | "aud" };
  };
  isCustom: boolean;
  userId: string;
};

// Well-known platforms with default settings
const WELL_KNOWN_PLATFORMS: PlatformSettingsData[] = [
  {
    platformName: "Fiverr",
    platformFeePercentage: 20,
    withdrawalFees: {
      platformToPayoneer: { amount: 3, currency: "dollars" as const },
      payoneerToLocalBank: { amount: 1, currency: "dollars" as const },
    },
    isCustom: false,
    userId: "system",
  },
  {
    platformName: "Freelancer",
    platformFeePercentage: 10,
    withdrawalFees: {
      platformToLocalBank: { amount: 1, currency: "dollars" as const },
    },
    isCustom: false,
    userId: "system",
  },
  {
    platformName: "Upwork",
    platformFeePercentage: 10,
    withdrawalFees: {
      platformToLocalBank: { amount: 0.99, currency: "dollars" as const },
    },
    isCustom: false,
    userId: "system",
  },
  {
    platformName: "Toptal",
    platformFeePercentage: 0,
    withdrawalFees: {},
    isCustom: false,
    userId: "system",
  },
  {
    platformName: "99designs",
    platformFeePercentage: 15,
    withdrawalFees: {},
    isCustom: false,
    userId: "system",
  },
];

/**
 * Seed well-known platforms into the database
 * This should be called once to initialize the database with default platforms
 * Uses a special userId "system" to mark them as well-known
 */
export async function seedWellKnownPlatforms() {
  try {
    await connectToDatabase();

    for (const platform of WELL_KNOWN_PLATFORMS) {
      // Check if platform already exists
      const existing = await ProjectSettingsModel.findOne({
        platformName: platform.platformName,
        userId: "system", // System-level platforms
      });

      if (!existing) {
        await ProjectSettingsModel.create(platform);
        console.log(`Seeded platform: ${platform.platformName}`);
      }
    }

    console.log("Well-known platforms seeded successfully");
  } catch (error) {
    console.error("Error seeding well-known platforms:", error);
    throw error;
  }
}

/**
 * Check if well-known platforms exist, if not, seed them
 */
export async function ensureWellKnownPlatforms() {
  try {
    await connectToDatabase();
    
    const count = await ProjectSettingsModel.countDocuments({
      userId: "system",
      isCustom: false,
    });

    if (count === 0) {
      console.log("No well-known platforms found, seeding...");
      await seedWellKnownPlatforms();
    }
  } catch (error) {
    console.error("Error ensuring well-known platforms:", error);
  }
}

