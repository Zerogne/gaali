"use server";

import { requireAdmin } from "@/lib/auth/admin";
import {
  getCompaniesCollection,
  getCompanyCollection,
} from "@/lib/db/companyDb";
import { generateSecurePassword } from "@/lib/utils/password";
import bcrypt from "bcryptjs";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Create a new company with a unique generated password
 */
export async function createCompany(
  formData: FormData,
): Promise<ActionResult<{ companyId: string; password: string }>> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const notes = formData.get("notes") as string | null;
    const customPassword = formData.get("password") as string | null;

    if (!name || !slug) {
      return {
        success: false,
        error: "Company name and slug are required",
      };
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return {
        success: false,
        error: "Slug must be lowercase alphanumeric with hyphens only",
      };
    }

    const companiesCollection = await getCompaniesCollection();

    // Check if slug already exists
    const existing = await companiesCollection.findOne({ companyId: slug });

    if (existing) {
      return {
        success: false,
        error: "A company with this slug already exists",
      };
    }

    // Use custom password if provided, otherwise generate a unique secure password
    const plainPassword = customPassword?.trim() || generateSecurePassword(12);

    // Validate password if custom (minimum 8 characters)
    if (customPassword && customPassword.trim().length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      };
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const companyCode = (formData.get("companyCode") as string)?.trim() || null;
    const uniqueCodePrefix = (formData.get("uniqueCodePrefix") as string)?.trim() || null;

    // Create company with hashed password
    await companiesCollection.insertOne({
      companyId: slug,
      name,
      notes: notes || null,
      password: hashedPassword, // Store hashed password
      companyCode: companyCode && /^\d{4}$/.test(companyCode) ? companyCode : null,
      uniqueCodePrefix: uniqueCodePrefix && /^[3-9]$/.test(uniqueCodePrefix) ? uniqueCodePrefix : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: {
        companyId: slug,
        password: plainPassword, // Return plain password so admin can share it
      },
    };
  } catch (error) {
    console.error("Create company error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create company",
    };
  }
}

/**
 * Create a worker for a company
 */
export async function createWorker(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const companyId = formData.get("companyId") as string;
    const fullName = formData.get("fullName") as string;
    const position = formData.get("position") as string | null;
    const phone = formData.get("phone") as string | null;
    const status = (formData.get("status") as string) || "ACTIVE";

    if (!companyId || !fullName) {
      return {
        success: false,
        error: "Company ID and full name are required",
      };
    }

    // Verify company exists
    const companiesCollection = await getCompaniesCollection();
    const company = await companiesCollection.findOne({ companyId });

    if (!company) {
      return {
        success: false,
        error: "Company not found",
      };
    }

    // Get workers collection for this company
    const workersCollection = await getCompanyCollection(companyId, "workers");

    // Generate a simple ID
    const workerId = `${companyId}-worker-${Date.now()}`;

    // Create worker
    await workersCollection.insertOne({
      id: workerId,
      companyId,
      fullName,
      position: position || null,
      phone: phone || null,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      data: { id: workerId },
    };
  } catch (error) {
    console.error("Create worker error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create worker",
    };
  }
}

/**
 * Update an existing company (name, notes, optional new password).
 * Slug (companyId) is read-only; changing it would require migrating company-scoped collections.
 */
export async function updateCompany(
  companyId: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  try {
    await requireAdmin();

    const name = formData.get("name") as string;
    const notes = (formData.get("notes") as string) || null;
    const newPassword = (formData.get("password") as string) || null;
    const passwordTrimmed = newPassword?.trim() || null;
    const companyCode = (formData.get("companyCode") as string)?.trim() || null;
    const uniqueCodePrefix = (formData.get("uniqueCodePrefix") as string)?.trim() || null;

    if (!name?.trim()) {
      return { success: false, error: "Company name is required" };
    }

    const companiesCollection = await getCompaniesCollection();
    const company = await companiesCollection.findOne({ companyId });
    if (!company) {
      return { success: false, error: "Company not found" };
    }

    if (passwordTrimmed && passwordTrimmed.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    if (companyCode && (companyCode.length !== 4 || !/^\d{4}$/.test(companyCode))) {
      return { success: false, error: "Company code must be 4 digits (e.g. 1001)" };
    }
    if (uniqueCodePrefix && !/^[3-9]$/.test(uniqueCodePrefix)) {
      return { success: false, error: "Unique code prefix must be a single digit 3-9" };
    }

    const update: Record<string, unknown> = {
      name: name.trim(),
      notes: notes?.trim() || null,
      companyCode: companyCode ? companyCode : ((company as any).companyCode ?? null),
      uniqueCodePrefix: uniqueCodePrefix ? uniqueCodePrefix : ((company as any).uniqueCodePrefix ?? null),
      updatedAt: new Date(),
    };
    if (passwordTrimmed) {
      update.password = await bcrypt.hash(passwordTrimmed, 10);
    }

    await companiesCollection.updateOne({ companyId }, { $set: update });
    return { success: true };
  } catch (error) {
    console.error("Update company error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update company",
    };
  }
}

/**
 * Get all companies
 */
export async function getCompanies() {
  await requireAdmin();
  const companiesCollection = await getCompaniesCollection();
  const companies = await companiesCollection
    .find({})
    .sort({ name: 1 })
    .toArray();

  // Get worker counts for each company
  const companiesWithCounts = await Promise.all(
    companies.map(async (company: any) => {
      const workersCollection = await getCompanyCollection(
        company.companyId,
        "workers",
      );
      const workerCount = await workersCollection.countDocuments();

      return {
        companyId: company.companyId,
        name: company.name,
        notes: company.notes || null,
        companyCode: company.companyCode || null,
        uniqueCodePrefix: company.uniqueCodePrefix || null,
        createdAt: company.createdAt,
        workerCount,
      };
    }),
  );

  return companiesWithCounts;
}

/**
 * Get company by ID with workers
 */
export async function getCompanyWithWorkers(companyId: string) {
  await requireAdmin();

  const companiesCollection = await getCompaniesCollection();
  const company = await companiesCollection.findOne({ companyId });

  if (!company) {
    return null;
  }

  const workersCollection = await getCompanyCollection(companyId, "workers");
  const workers = await workersCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return {
    companyId: company.companyId,
    name: company.name,
    notes: company.notes || null,
    companyCode: company.companyCode || null,
    uniqueCodePrefix: company.uniqueCodePrefix || null,
    createdAt: company.createdAt,
    workers: workers.map((w: any) => ({
      id: w.id,
      fullName: w.fullName,
      position: w.position || null,
      phone: w.phone || null,
      status: w.status || "ACTIVE",
      createdAt: w.createdAt,
    })),
  };
}
