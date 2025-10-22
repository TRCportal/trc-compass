import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddContributionDialog } from "@/components/AddContributionDialog";
import { EditContributionDialog } from "@/components/EditContributionDialog";
import { ViewContributionDialog } from "@/components/ViewContributionDialog";
import { ContributionCalendar } from "@/components/ContributionCalendar";
import { useUserRole } from "@/hooks/useUserRole";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [viewingContribution, setViewingContribution] = useState<Contribution | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

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
        .select("*")
        .order("payment_date", { ascending: false });

      // If not admin or treasurer, only show own contributions
      if (!isAdmin && !isTreasurer && userId) {
        query = query.eq("member_id", userId);
      } else {
        query = query.limit(100);
      }

      const { data: contributionsData, error: contribError } = await query;
      if (contribError) throw contribError;

      // Fetch member names separately
      if (contributionsData && contributionsData.length > 0) {
        const memberIds = [...new Set(contributionsData.map(c => c.member_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", memberIds);

        if (profilesError) throw profilesError;

        // Map profiles to contributions
        const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]));
        const enrichedData = contributionsData.map(c => ({
          ...c,
          profiles: { full_name: profilesMap.get(c.member_id) || "Unknown" }
        }));

        setContributions(enrichedData);
      } else {
        setContributions([]);
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("contributions")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contribution deleted successfully",
      });

      fetchContributions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contribution",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
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
                            <TableHead className="text-right">Actions</TableHead>
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
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setViewingContribution(contribution)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {isAdmin && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingContribution(contribution)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDeletingId(contribution.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
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

      {editingContribution && (
        <EditContributionDialog
          contribution={editingContribution}
          open={!!editingContribution}
          onOpenChange={(open) => !open && setEditingContribution(null)}
          onContributionUpdated={fetchContributions}
        />
      )}

      {viewingContribution && (
        <ViewContributionDialog
          contribution={viewingContribution}
          open={!!viewingContribution}
          onOpenChange={(open) => !open && setViewingContribution(null)}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contribution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contribution? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Contributions;
