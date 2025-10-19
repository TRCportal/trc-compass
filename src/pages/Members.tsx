import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddMemberDialog } from "@/components/AddMemberDialog";

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
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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
              <h1 className="text-2xl font-bold text-primary">Members</h1>
            </div>
            <AddMemberDialog onMemberAdded={fetchMembers} />
          </header>

          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Members Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p className="col-span-full text-center text-muted-foreground">Loading members...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">No members found</p>
              ) : (
                filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{member.full_name}</CardTitle>
                          <Badge className={`${getStatusColor(member.status)} mt-2`}>
                            {member.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.id_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">ID:</span>
                          <span>{member.id_number}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground pt-2">
                        Joined: {new Date(member.date_joined).toLocaleDateString()}
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
