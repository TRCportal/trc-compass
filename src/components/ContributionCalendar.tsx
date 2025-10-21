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
        <CardTitle>Weekly Contribution Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-13 gap-1">
          {weeks.map(weekNum => {
            const contribution = getWeekStatus(weekNum);
            const isPaid = contribution?.status === "paid";
            const isCurrent = weekNum === currentWeek;

            return (
              <div
                key={weekNum}
                className={`
                  relative aspect-square rounded-sm flex items-center justify-center text-xs
                  ${isPaid ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}
                  ${isCurrent ? "ring-2 ring-primary" : ""}
                  hover:scale-110 transition-transform cursor-pointer
                `}
                title={`Week ${weekNum}${contribution ? ` - KSh ${contribution.amount}` : ""}`}
              >
                {isPaid ? (
                  <CheckCircle className="h-3 w-3" />
                ) : weekNum < currentWeek ? (
                  <XCircle className="h-3 w-3" />
                ) : null}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent/20 rounded-sm"></div>
            <span className="text-sm">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded-sm"></div>
            <span className="text-sm">Unpaid / Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded-sm ring-2 ring-primary"></div>
            <span className="text-sm">Current Week</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
          <h4 className="font-semibold mb-2">Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Weeks Paid:</p>
              <p className="text-lg font-bold text-accent">{contributions.filter(c => c.status === "paid").length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Contributed:</p>
              <p className="text-lg font-bold text-primary">
                KSh {contributions.reduce((sum, c) => sum + Number(c.amount), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
