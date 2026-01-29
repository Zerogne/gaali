"use client";

import { CompanyLoginForm } from "@/components/auth/CompanyLoginForm";
import { WorkerSelector } from "@/components/auth/WorkerSelector";
import { Card } from "@/components/ui/card";
import type { Worker } from "@/lib/auth/mockData";
import type { CompanyMetadata } from "@/lib/companies/metadata";
import { getCompanyWorkers } from "@/lib/companies/workers";
import Image from "next/image";
import { useEffect, useState } from "react";

type LoginStep = "company" | "worker";

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("company");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyMetadata[]>([]);
  const [companyWorkers, setCompanyWorkers] = useState<Worker[]>([]);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const selectedCompany = companies.find(
    (c) => c.companyId === selectedCompanyId,
  );

  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // Load companies on mount
  useEffect(() => {
    async function loadCompanies() {
      setIsLoadingCompanies(true);
      setCompaniesError(null);
      try {
        // Use API route instead of direct server action for better production compatibility
        const response = await fetch("/api/companies");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || "";
          const isMongoError =
            errorMessage.includes("MongoNetworkError") ||
            errorMessage.includes("SSL") ||
            errorMessage.includes("tlsv1") ||
            response.status === 500;

          if (isMongoError) {
            setCompaniesError(
              "Мэдээллийн сантай холбогдох үед алдаа гарлаа. Системийн администратортой холбогдоно уу.",
            );
          } else {
            setCompaniesError(
              "Компанийн жагсаалтыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.",
            );
          }
          console.error(
            "Failed to load companies:",
            response.status,
            errorData,
          );
        }
      } catch (error) {
        console.error("Error loading companies:", error);
        setCompaniesError(
          "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгаад дахин оролдоно уу.",
        );
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  // Load workers when company is authenticated
  const loadWorkers = async () => {
    if (!selectedCompanyId || step !== "worker") {
      setCompanyWorkers([]);
      return;
    }

    setIsLoadingWorkers(true);
    try {
      const workers = await getCompanyWorkers(selectedCompanyId);
      setCompanyWorkers(workers);
    } catch (error) {
      console.error("Error loading workers:", error);
      setCompanyWorkers([]);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [selectedCompanyId, step]);

  const handleCompanyLoginSuccess = (companyId: string) => {
    // After company login is successful, move to worker selection
    setSelectedCompanyId(companyId);
    setStep("worker");
    setSelectedWorkerId(null); // Reset worker selection
  };

  const handleBackToCompany = () => {
    setStep("company");
    setSelectedWorkerId(null); // Reset worker selection when going back
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <Image
              src="/logo.png"
              alt="УХААЛАГ ГАРЦ СИСТЕМ"
              width={800}
              height={200}
              className="w-full max-w-2xl h-auto rounded-xl"
              priority
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-4 md:p-6 bg-white border-gray-200 shadow-lg">
          <div
            className={`
              transition-opacity duration-300
              ${step === "company" ? "opacity-100" : "hidden"}
            `}
          >
            {isLoadingCompanies ? (
              <div className="text-center py-8">
                <p className="text-gray-500">жагсаалтын татаж байна...</p>
              </div>
            ) : companiesError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 font-medium mb-2">Алдаа</p>
                  <p className="text-red-500 text-sm">{companiesError}</p>
                </div>
                <button
                  onClick={() => {
                    setCompaniesError(null);
                    setIsLoadingCompanies(true);
                    fetch("/api/companies")
                      .then((res) => {
                        if (res.ok) {
                          return res.json();
                        }
                        throw new Error("Failed to load");
                      })
                      .then((data) => {
                        setCompanies(data);
                        setCompaniesError(null);
                      })
                      .catch((err) => {
                        console.error("Retry error:", err);
                        setCompaniesError("Дахин оролдлого амжилтгүй боллоо.");
                      })
                      .finally(() => setIsLoadingCompanies(false));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Дахин оролдох
                </button>
              </div>
            ) : (
              <CompanyLoginForm
                companies={companies}
                onSuccess={handleCompanyLoginSuccess}
              />
            )}
          </div>

          <div
            className={`
              transition-opacity duration-300
              ${step === "worker" ? "opacity-100" : "hidden"}
            `}
          >
            {selectedCompany && (
              <WorkerSelector
                companyName={selectedCompany.name}
                companyId={selectedCompany.companyId}
                workers={companyWorkers}
                selectedWorkerId={selectedWorkerId}
                onSelect={setSelectedWorkerId}
                onBack={handleBackToCompany}
                onWorkerAdded={loadWorkers}
                isLoading={isLoadingWorkers}
              />
            )}
          </div>
        </Card>

        <p className="mt-6 text-center">
          <a
            href="https://xp-agency.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Developed by XP Agency
          </a>
        </p>
      </div>
    </div>
  );
}
