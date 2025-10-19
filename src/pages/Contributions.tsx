import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp } from "lucide-react";

const Contributions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<any[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchContributions();
    };

    checkAuth();
  }, [navigate]);

  const fetchContributions = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data, error } = await supabase
        .from("contributions")
        .select(`
          *,
          profiles:member_id (full_name)
        `)
        .order("payment_date", { ascending: false })
        .limit(10);

      if (error) throw error;

      const { data: monthlyData } = await supabase
        .from("contributions")
        .select("amount")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      const total = monthlyData?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

      setContributions(data || []);
      setMonthlyTotal(total);
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Contributions</h1>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Monthly Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    KSh {monthlyTotal.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Weekly contributions tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Weekly Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">KSh 100</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Per member contribution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                    85%
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Members paid on time
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Contributions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contributions</CardTitle>
                <CardDescription>Latest payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : contributions.length === 0 ? (
                    <p className="text-center text-muted-foreground">No contributions recorded yet</p>
                  ) : (
                    contributions.map((contribution) => (
                      <div
                        key={contribution.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{contribution.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Week {contribution.week_number}, {new Date(contribution.payment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={contribution.status === "paid" ? "default" : "secondary"}>
                            {contribution.status}
                          </Badge>
                          <span className="font-bold text-primary">
                            KSh {Number(contribution.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Contributions;
