import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddContributionDialog } from "@/components/AddContributionDialog";
import { ContributionCalendar } from "@/components/ContributionCalendar";
import { useUserRole } from "@/hooks/useUserRole";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  week_number: number;
  month: number;
  year: number;
  status: string;
  payment_date: string;
  payment_method: string;
  profiles?: any;
}

const Contributions = () => {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isTreasurer, userId } = useUserRole();

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
      let query = supabase
        .from("contributions")
        .select("*, profiles(full_name)")
        .order("payment_date", { ascending: false });

      // If not admin or treasurer, only show own contributions
      if (!isAdmin && !isTreasurer && userId) {
        query = query.eq("member_id", userId);
      } else {
        query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContributions(data || []);
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
              <h1 className="text-2xl font-bold text-primary">
                {isAdmin || isTreasurer ? "All Contributions" : "My Contributions"}
              </h1>
            </div>
            {(isAdmin || isTreasurer) && (
              <AddContributionDialog onContributionAdded={fetchContributions} />
            )}
          </header>

          <div className="p-6 space-y-6">
            {/* Member view - show calendar */}
            {!isAdmin && !isTreasurer && userId && (
              <ContributionCalendar memberId={userId} />
            )}

            {/* Admin/Treasurer view - show detailed table */}
            {(isAdmin || isTreasurer) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading contributions...</p>
                  ) : contributions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No contributions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Week</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.map((contribution) => (
                            <TableRow key={contribution.id}>
                              <TableCell className="font-medium">
                                {contribution.profiles?.full_name || "Unknown"}
                              </TableCell>
                              <TableCell>Week {contribution.week_number}</TableCell>
                              <TableCell className="text-primary font-semibold">
                                KSh {Number(contribution.amount).toLocaleString()}
                              </TableCell>
                              <TableCell className="capitalize">{contribution.payment_method}</TableCell>
                              <TableCell>
                                {new Date(contribution.payment_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <span className="text-accent font-medium capitalize">
                                  {contribution.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Contributions;
