import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

interface EditRoleDialogProps {
  member: any;
  onRoleUpdated: () => void;
}

export function EditRoleDialog({ member, onRoleUpdated }: EditRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchMemberRoles();
    }
  }, [open, member.id]);

  const fetchMemberRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", member.id);

      if (error) throw error;
      setRoles(data?.map(r => r.role) || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleRoleToggle = (role: string, checked: boolean) => {
    if (checked) {
      setRoles([...roles, role]);
    } else {
      setRoles(roles.filter(r => r !== role));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Delete existing roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", member.id);

      // Insert new roles
      if (roles.length > 0) {
        const { error } = await supabase
          .from("user_roles")
          .insert(roles.map(role => ({ 
            user_id: member.id, 
            role: role as "admin" | "treasurer" | "member" 
          })));

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Roles updated successfully",
      });

      setOpen(false);
      onRoleUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Assign roles to {member.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="admin"
              checked={roles.includes("admin")}
              onCheckedChange={(checked) => handleRoleToggle("admin", checked as boolean)}
            />
            <Label htmlFor="admin" className="cursor-pointer">
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-sm text-muted-foreground">Full access to all features</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="treasurer"
              checked={roles.includes("treasurer")}
              onCheckedChange={(checked) => handleRoleToggle("treasurer", checked as boolean)}
            />
            <Label htmlFor="treasurer" className="cursor-pointer">
              <div>
                <p className="font-medium">Treasurer</p>
                <p className="text-sm text-muted-foreground">Manage contributions and finances</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="member"
              checked={roles.includes("member")}
              onCheckedChange={(checked) => handleRoleToggle("member", checked as boolean)}
            />
            <Label htmlFor="member" className="cursor-pointer">
              <div>
                <p className="font-medium">Member</p>
                <p className="text-sm text-muted-foreground">Standard member access</p>
              </div>
            </Label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Roles"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
