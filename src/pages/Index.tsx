import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, FileText, Shield, TrendingUp } from "lucide-react";
import trcLogo from "@/assets/trc-logo.png";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[600px] overflow-hidden">
        <img
          src={heroImage}
          alt="Community Unity"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/80"></div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <img src={trcLogo} alt="TRC Logo" className="h-32 w-32 mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            Tassia Riverside Community
          </h1>
          <p className="text-2xl text-accent font-semibold mb-2">From Vision to Action</p>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
            Empowering our community through transparent administration, collaborative growth, and unified vision
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="text-lg px-8 py-6"
          >
            Access Portal
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Complete Community Management</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage membership, finances, events, and communications in one secure platform
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Member Management</CardTitle>
              <CardDescription>
                Comprehensive member profiles with status tracking, contact information, and activity history
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>
                Weekly contributions, payment methods, transaction records, and detailed financial analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Events & Meetings</CardTitle>
              <CardDescription>
                Schedule events, manage attendance, record minutes, and engage members with RSVP functionality
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                Store and access constitution, by-laws, meeting minutes, and important community documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Visual insights into member growth, contribution trends, and community engagement metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure authentication with admin, treasurer, and member roles for proper access control
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/95 to-primary/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join us in building a stronger, more connected Tassia Riverside Community
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Tassia Riverside Community. All rights reserved.</p>
          <p className="mt-2 text-accent font-medium">From Vision to Action</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
