"use server";

import { queryTrafficViolations } from "@/lib/trafficViolation/queryTrafficViolations";

export interface Violation {
  licensePlate: string;
  plateColor: string;
  vehicleType: string;
  violationTime: string;
  violationLocation: string;
  violationBehavior: string;
  status: string;
  detectionUnit: string;
}

export interface SearchResult {
  success: boolean;
  violations?: Violation[];
  error?: string;
}

export async function searchTrafficViolations(
  licensePlate: string,
  vehicleType: string
): Promise<SearchResult> {
  try {
    if (!licensePlate || !licensePlate.trim()) {
      return {
        success: false,
        error: "License plate is required",
      };
    }

    const violations = await queryTrafficViolations(
      licensePlate.trim(),
      vehicleType
    );

    return {
      success: true,
      violations: violations || [],
    };
  } catch (error) {
    console.error("Traffic violations query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to query traffic violations",
    };
  }
}
