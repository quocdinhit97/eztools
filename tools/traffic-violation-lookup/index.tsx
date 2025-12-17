"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { searchTrafficViolations, type Violation } from "@/app/actions/traffic-violations";

interface SearchHistory {
  licensePlate: string;
  vehicleType: string;
  timestamp: number;
  violations: Violation[];
}

const VEHICLE_TYPES = {
  CAR: "1",
  MOTORCYCLE: "2",
  ELECTRIC_BIKE: "3",
} as const;

const HISTORY_KEY = "traffic-violation-history";
const MAX_HISTORY = 10;

export default function TrafficViolationLookup() {
  const t = useTranslations("tools.trafficViolationLookup");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES.MOTORCYCLE);
  const [violations, setViolations] = useState<Violation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [showRegulationsModal, setShowRegulationsModal] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to parse history:", error);
      }
    }
  }, []);

  // Save to history
  const saveToHistory = (plate: string, type: string, results: Violation[]) => {
    if (!results || results.length === 0) return;

    // Check if this plate already exists in history
    const existingIndex = history.findIndex((h) => h.licensePlate === plate);
    
    let updatedHistory: SearchHistory[];
    if (existingIndex !== -1) {
      // Update existing entry's timestamp, vehicle type, and violations
      updatedHistory = [...history];
      updatedHistory[existingIndex] = {
        licensePlate: plate,
        vehicleType: type,
        timestamp: Date.now(),
        violations: results,
      };
    } else {
      // Add new entry
      const newEntry: SearchHistory = {
        licensePlate: plate,
        vehicleType: type,
        timestamp: Date.now(),
        violations: results,
      };
      updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
    }

    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const handleSearch = async () => {
    if (!licensePlate.trim()) {
        console.log(`Please enter a license plate number. ${licensePlate}`);
      toast.error(t("enterPlateNumber"));
      return;
    }

    setLoading(true);
    setViolations(null);

    try {
      const result = await searchTrafficViolations(
        licensePlate.trim(),
        vehicleType
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to search");
      }

      setViolations(result.violations || []);
      
      // Save to history if violations found - use license plate from API response
      if (result.violations && result.violations.length > 0) {
        // Use the license plate from the first violation result (normalized by API)
        const normalizedPlate = result.violations[0].licensePlate;
        saveToHistory(normalizedPlate, vehicleType, result.violations);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t("searchError"));
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: SearchHistory) => {
    setLicensePlate(item.licensePlate);
    setVehicleType(item.vehicleType);
    setViolations(item.violations);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast.success(t("clearHistory"));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Section */}
      <div className="bg-white dark:bg-card rounded-lg border border-border p-5 space-y-4">
        {/* Data Source Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Icon name="Info" className="size-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs text-blue-800 dark:text-blue-400 font-medium">
              {t("dataSourceNotification")}
            </p>
          </div>
        </div>

        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("vehicleType")}
        </h3>
        <div className="flex gap-2">
            <button
              onClick={() => setVehicleType(VEHICLE_TYPES.CAR)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                vehicleType === VEHICLE_TYPES.CAR
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <Icon name="Car" className="size-4" />
              <span>{t("car")}</span>
            </button>
            <button
              onClick={() => setVehicleType(VEHICLE_TYPES.MOTORCYCLE)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                vehicleType === VEHICLE_TYPES.MOTORCYCLE
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <Icon name="Bike" className="size-4" />
              <span>{t("motorcycle")}</span>
            </button>
            <button
              onClick={() => setVehicleType(VEHICLE_TYPES.ELECTRIC_BIKE)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                vehicleType === VEHICLE_TYPES.ELECTRIC_BIKE
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <Icon name="Bike" className="size-4" />
              <span>{t("electricBike")}</span>
            </button>
          </div>
          
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("licensePlateLabel")}
            </h3>
            <Input
              id="license-plate"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder={t("licensePlatePlaceholder")}
              className="text-base font-mono h-11 bg-muted/50 border-muted"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>
          
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11 font-medium"
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                {t("searching")}
              </>
            ) : (
              <>
                <Icon name="Search" className="mr-2 h-4 w-4" />
                {t("search")}
              </>
            )}
          </Button>
      </div>

      {/* History - Show when no search has been performed */}
      {violations === null && (
        <div className="bg-white dark:bg-card rounded-lg border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Icon name="History" className="size-4" />
              {t("history")}
            </h3>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-auto py-1 px-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                {t("clearHistory")}
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Icon name="ClipboardX" className="size-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("noHistory")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => loadFromHistory(item)}
                  className="text-left p-3 rounded-lg border border-border hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-shrink-0">
                      {item.vehicleType === VEHICLE_TYPES.CAR ? (
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-1.5 rounded">
                          <Icon name="Car" className="size-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      ) : (
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-1.5 rounded">
                          <Icon name="Bike" className="size-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">
                      {item.licensePlate}
                    </span>
                    <Badge className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-0 text-xs px-2">
                      {item.violations.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground ml-9">
                    {formatDate(item.timestamp)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results & Important Notes - Side by Side */}
      {violations !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-card rounded-lg border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Icon name="ClipboardList" className="size-4" />
                  {t("results")}
                </h3>
                {violations.length > 0 && (
                  <Badge className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-0 text-xs font-medium px-2.5 py-0.5">
                    {t("detected", { count: violations.length })}
                  </Badge>
                )}
              </div>

            {violations.length === 0 ? (
              <div className="text-center py-16 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-dashed border-green-200 dark:border-green-900">
                <Icon name="CheckCircle2" className="size-12 text-green-600 dark:text-green-500 mx-auto mb-3" />
                <p className="text-base font-semibold text-green-700 dark:text-green-400">
                  {t("noViolations")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.map((violation, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 bg-muted/30 dark:bg-muted/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-card border-2 border-foreground/20 rounded-md px-3 py-1">
                          <span className="font-mono font-bold text-base">
                            {violation.licensePlate}
                          </span>
                        </div>
                        {vehicleType === VEHICLE_TYPES.CAR ? (
                          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                            <Icon name="Car" className="size-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        ) : (
                          <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                            <Icon name="Bike" className="size-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        )}
                      </div>
                      <Badge className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-0 text-xs">
                        ● {t("notProcessed")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                        <span className="text-orange-700 dark:text-orange-400 uppercase text-xs font-bold tracking-wide flex items-center gap-1.5 mb-1">
                          <Icon name="Palette" className="size-3.5" />
                          {t("plateColor")}
                        </span>
                        <span className="font-bold text-sm">{violation.plateColor}</span>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                        <span className="text-orange-700 dark:text-orange-400 uppercase text-xs font-bold tracking-wide flex items-center gap-1.5 mb-1">
                          <Icon name="Clock" className="size-3.5" />
                          {t("violationTime")}
                        </span>
                        <span className="font-bold text-sm">{violation.violationTime}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="pt-2">
                        <p className="text-muted-foreground uppercase text-xs font-semibold tracking-wide flex items-center gap-1.5 mb-2">
                          <Icon name="MapPin" className="size-3.5" />
                          {t("location")}
                        </p>
                        <p className="font-medium leading-relaxed">{violation.violationLocation}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase text-xs font-semibold tracking-wide flex items-center gap-1.5 mb-2">
                          <Icon name="AlertCircle" className="size-3.5" />
                          {t("behavior")}
                        </p>
                        <p className="font-medium leading-relaxed">{violation.violationBehavior}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground uppercase text-xs font-semibold tracking-wide flex items-center gap-1.5 mb-2">
                          <Icon name="Building2" className="size-3.5" />
                          {t("detectionUnit")}
                        </p>
                        <p className="font-medium leading-relaxed">{violation.detectionUnit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Important Notes - Sidebar */}
          <div className="space-y-4">
            {/* Important Notes */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="AlertCircle" className="size-5 text-orange-600 dark:text-orange-500" />
                <h3 className="font-bold text-sm text-orange-900 dark:text-orange-300">{t("importantNotes")}</h3>
              </div>
              <div className="space-y-2.5 text-xs text-orange-800 dark:text-orange-400 leading-relaxed">
                <p>{t("note1")}</p>
                <p>{t("note2")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegulationsModal(true)}
                className="w-full border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-xs font-medium h-9"
              >
                <Icon name="FileText" className="mr-1.5 h-3.5 w-3.5" />
                {t("viewFullRegulations")}
              </Button>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-card rounded-lg border border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Icon name="History" className="size-4" />
                  {t("history")}
                </h3>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-auto py-1 px-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    {t("clearHistory")}
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Icon name="ClipboardX" className="size-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t("noHistory")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-shrink-0">
                          {item.vehicleType === VEHICLE_TYPES.CAR ? (
                            <Icon name="Car" className="size-3.5 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Icon name="Bike" className="size-3.5 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                        <span className="font-mono font-bold text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 flex-1">
                          {item.licensePlate}
                        </span>
                        <Badge className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-0 text-xs px-2">
                          {item.violations.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {formatDate(item.timestamp)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regulations Modal */}
      <Dialog open={showRegulationsModal} onOpenChange={setShowRegulationsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Icon name="FileText" className="size-5" />
              {t("regulationsModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("regulationsModalSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed">
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
              <p className="text-foreground">{t("regulationsContent")}</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <Icon name="ListChecks" className="size-4 text-orange-600 dark:text-orange-400" />
                {t("regulationsProcessTitle")}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-foreground">
                <li>{t("regulationsProcess1")}</li>
                <li>{t("regulationsProcess2")}</li>
                <li>{t("regulationsProcess3")}</li>
                <li>{t("regulationsProcess4")}</li>
                <li>{t("regulationsProcess5")}</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
