import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTreasurer, setIsTreasurer] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roles) {
        setIsAdmin(roles.some(r => r.role === "admin"));
        setIsTreasurer(roles.some(r => r.role === "treasurer"));
        setIsMember(roles.some(r => r.role === "member"));
      }

      setLoading(false);
    };

    checkRole();
  }, []);

  return { isAdmin, isTreasurer, isMember, loading, userId };
}
