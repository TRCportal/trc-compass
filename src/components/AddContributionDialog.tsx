import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const contributionSchema = z.object({
  member_id: z.string().min(1, { message: "Please select a member" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  payment_method: z.enum(["cash", "mpesa", "bank_transfer"]),
  transaction_id: z.string().optional(),
  week_number: z.string().min(1, { message: "Week number is required" }),
  notes: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

interface AddContributionDialogProps {
  onContributionAdded: () => void;
}

export function AddContributionDialog({ onContributionAdded }: AddContributionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const { toast } = useToast();

  const currentDate = new Date();
  const currentWeek = Math.ceil(currentDate.getDate() / 7);

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      member_id: "",
      amount: "100",
      payment_method: "mpesa",
      transaction_id: "",
      week_number: currentWeek.toString(),
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const onSubmit = async (values: ContributionFormValues) => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const { error } = await supabase.from("contributions").insert({
        member_id: values.member_id,
        amount: parseFloat(values.amount),
        payment_method: values.payment_method,
        transaction_id: values.transaction_id || null,
        week_number: parseInt(values.week_number),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        status: "paid",
        notes: values.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contribution recorded successfully",
      });

      form.reset();
      setOpen(false);
      onContributionAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record contribution",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Contribution</DialogTitle>
          <DialogDescription>
            Record a member's weekly contribution payment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="member_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KSh)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SH12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="week_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Week Number</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
