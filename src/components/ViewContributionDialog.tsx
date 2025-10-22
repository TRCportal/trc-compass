import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, User, Hash, FileText, Clock } from "lucide-react";

interface ViewContributionDialogProps {
  contribution: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewContributionDialog({
  contribution,
  open,
  onOpenChange,
}: ViewContributionDialogProps) {
  if (!contribution) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "late":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-muted";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "mpesa":
        return "M-Pesa";
      case "cash":
        return "Cash";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contribution Details</DialogTitle>
          <DialogDescription>
            Complete information about this contribution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Member</p>
              <p className="font-semibold">{contribution.profiles?.full_name || "Unknown"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-semibold text-lg text-primary">
                KSh {Number(contribution.amount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Date</p>
              <p className="font-medium">
                {new Date(contribution.payment_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Week Number</p>
              <p className="font-medium">Week {contribution.week_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{getMethodLabel(contribution.payment_method)}</p>
            </div>
          </div>

          {contribution.transaction_id && (
            <div className="flex items-center gap-3 pb-3 border-b">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm">{contribution.transaction_id}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pb-3 border-b">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(contribution.status)}>
                {contribution.status}
              </Badge>
            </div>
          </div>

          {contribution.notes && (
            <div className="flex items-start gap-3 pb-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium text-sm">{contribution.notes}</p>
              </div>
            </div>
          )}

          <div className="pt-2 text-xs text-muted-foreground">
            <p>
              Period: {new Date(contribution.year, contribution.month - 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
