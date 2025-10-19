import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { AddEventDialog } from "@/components/AddEventDialog";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  agenda: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchEvents();
    };

    checkAuth();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-primary">Events</h1>
            </div>
            <AddEventDialog onEventAdded={fetchEvents} />
          </header>

          <div className="p-6 space-y-6">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading events...</p>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No upcoming events</p>
                  <p className="text-sm text-muted-foreground mb-4">Create your first community event</p>
                  <AddEventDialog onEventAdded={fetchEvents} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const { day, month, time } = formatEventDate(event.event_date);
                  return (
                    <Card key={event.id} className="hover:shadow-elevated transition-shadow">
                      <CardHeader>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-lg p-3 min-w-[60px]">
                            <span className="text-2xl font-bold">{day}</span>
                            <span className="text-sm uppercase">{month}</span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {event.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        {event.venue && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{event.venue}</span>
                          </div>
                        )}
                        <Button variant="outline" className="w-full">
                          RSVP
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Events;
