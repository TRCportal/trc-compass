import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface Contribution {
  id: string;
  amount: number;
  week_number: number;
  month: number;
  year: number;
  status: string;
  payment_date: string;
  payment_method: string;
}

export function ContributionCalendar({ memberId }: { memberId: string }) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributions();
  }, [memberId]);

  const fetchContributions = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("contributions")
        .select("*")
        .eq("member_id", memberId)
        .eq("year", currentYear)
        .order("week_number", { ascending: true });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStatus = (weekNum: number) => {
    return contributions.find(c => c.week_number === weekNum);
  };

  const currentWeek = Math.ceil(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Contribution Calendar - {new Date().getFullYear()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-13 gap-2 mb-6">
          {weeks.map(weekNum => {
            const contribution = getWeekStatus(weekNum);
            const isPaid = contribution?.status === "paid";
            const isCurrent = weekNum === currentWeek;
            const isPast = weekNum < currentWeek;

            return (
              <div
                key={weekNum}
                className={`
                  relative aspect-square rounded-md flex flex-col items-center justify-center text-xs font-medium
                  transition-all duration-200 hover:scale-105 cursor-pointer
                  ${isPaid ? "bg-green-500/20 text-green-700 dark:text-green-400 border-2 border-green-500" : ""}
                  ${!isPaid && isPast ? "bg-red-500/20 text-red-700 dark:text-red-400 border-2 border-red-500" : ""}
                  ${!isPaid && !isPast ? "bg-muted text-muted-foreground border-2 border-border" : ""}
                  ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                `}
                title={`Week ${weekNum}${contribution ? ` - KSh ${contribution.amount.toLocaleString()} (${contribution.payment_method})` : isPast ? " - Unpaid" : " - Upcoming"}`}
              >
                <span className="text-[10px] font-bold">W{weekNum}</span>
                {isPaid && <CheckCircle className="h-3 w-3 mt-0.5" />}
                {!isPaid && isPast && <XCircle className="h-3 w-3 mt-0.5" />}
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500/20 border-2 border-green-500 rounded"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500/20 border-2 border-red-500 rounded"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted border-2 border-border rounded"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted border-2 border-border rounded ring-2 ring-primary"></div>
            <span>Current Week</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/10 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Weeks Paid</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {contributions.filter(c => c.status === "paid").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Weeks Missed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currentWeek - 1 - contributions.filter(c => c.status === "paid").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Contributed</p>
            <p className="text-2xl font-bold text-primary">
              KSh {contributions.reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
