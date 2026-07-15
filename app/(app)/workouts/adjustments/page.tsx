"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useTraining } from "@/components/training/TrainingProvider";

export default function AdjustmentsPage() {
  const { adjustments, setAdjustmentStatus, isReady } = useTraining();

  if (!isReady) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        Plan adjustments
      </h1>
      <p className="mt-1 text-sm text-muted">
        Recommendations based on your workout feedback, recovery, and performance.
        Approve for your coach/admin pipeline — auto-apply comes later.
      </p>

      <div className="mt-6 space-y-3">
        {adjustments.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              No recommendations yet. Finish a guided workout to generate them.
            </p>
          </Card>
        ) : (
          adjustments.map((adj) => (
            <Card key={adj.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        adj.status === "approved"
                          ? "success"
                          : adj.status === "dismissed"
                            ? "default"
                            : "accent"
                      }
                    >
                      {adj.status}
                    </Badge>
                    <Badge className="capitalize">
                      {adj.type.replace(/-/g, " ")}
                    </Badge>
                  </div>
                  <h2 className="mt-2 font-display font-semibold">{adj.title}</h2>
                  <p className="mt-1 text-sm text-muted">{adj.reason}</p>
                  {adj.details && (
                    <p className="mt-1 text-xs text-muted">{adj.details}</p>
                  )}
                </div>
                {adj.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setAdjustmentStatus(adj.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdjustmentStatus(adj.id, "dismissed")}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
