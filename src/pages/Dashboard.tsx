import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import heroImage from "@/assets/hero-community.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isTreasurer } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalContributions: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchStats();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const [membersRes, totalContributionsRes, eventsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.rpc("get_total_contributions"),
        supabase.from("events").select("*", { count: "exact" }).gte("event_date", new Date().toISOString()),
      ]);

      const activeCount = membersRes.data?.filter(m => m.status === "active").length || 0;

      setStats({
        totalMembers: membersRes.count || 0,
        activeMembers: activeCount,
        totalContributions: Number(totalContributionsRes.data || 0),
        upcomingEvents: eventsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          </header>

          <div className="p-6 space-y-6">
            {/* Hero Section */}
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={heroImage} 
                  alt="Community Unity" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center px-8">
                  <div>
                    <h2 className="text-3xl font-bold text-primary-foreground mb-2">
                      Welcome to TRC Community Portal
                    </h2>
                    <p className="text-primary-foreground/90 text-lg">
                      From Vision to Action - Building our community together
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalMembers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeMembers} active members
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    KSh {stats.totalContributions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">All time contributions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">Events scheduled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">+12%</div>
                  <p className="text-xs text-muted-foreground">This quarter</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>Stay updated with community news</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent announcements</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(isAdmin || isTreasurer) ? (
                    <>
                      <button 
                        onClick={() => navigate("/members")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        View Members
                      </button>
                      <button 
                        onClick={() => navigate("/contributions")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        Record Contribution
                      </button>
                      <button 
                        onClick={() => navigate("/events")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        View Events
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => navigate("/members")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        My Profile
                      </button>
                      <button 
                        onClick={() => navigate("/contributions")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        My Contributions
                      </button>
                      <button 
                        onClick={() => navigate("/events")}
                        className="w-full text-left px-4 py-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        Events
                      </button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
