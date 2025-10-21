import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Trash2 } from "lucide-react";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { EditMemberDialog } from "@/components/EditMemberDialog";
import { EditRoleDialog } from "@/components/EditRoleDialog";
import { ContributionCalendar } from "@/components/ContributionCalendar";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Member {
  id: string;
  full_name: string;
  phone: string | null;
  id_number: string | null;
  status: string;
  date_joined: string;
}

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin, isTreasurer, userId } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchMembers();
    };

    checkAuth();
  }, [navigate]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("date_joined", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member deleted successfully",
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete member",
        variant: "destructive",
      });
    }
  };

  // Member view - show only their own profile
  if (!isAdmin && !isTreasurer && userId) {
    const currentMember = members.find(m => m.id === userId);
    
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1">
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-primary">My Profile</h1>
              </div>
            </header>

            <div className="p-6 space-y-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading...</p>
              ) : currentMember ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{currentMember.full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{currentMember.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ID Number</p>
                          <p className="font-medium">{currentMember.id_number || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge
                            variant={
                              currentMember.status === "active"
                                ? "default"
                                : currentMember.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {currentMember.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date Joined</p>
                          <p className="font-medium">
                            {new Date(currentMember.date_joined).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <ContributionCalendar memberId={currentMember.id} />
                </>
              ) : (
                <p className="text-center text-muted-foreground">Profile not found</p>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Admin/Treasurer view
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Members</h1>
            </div>
            {isAdmin && <AddMemberDialog onMemberAdded={fetchMembers} />}
          </header>

          <div className="p-6 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p className="col-span-full text-center text-muted-foreground">Loading...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">No members found</p>
              ) : (
                filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-elevated transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                          {member.id_number && (
                            <p className="text-sm text-muted-foreground">ID: {member.id_number}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : member.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <EditMemberDialog member={member} onMemberUpdated={fetchMembers} />
                            <EditRoleDialog member={member} onRoleUpdated={fetchMembers} />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {member.full_name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Members;
