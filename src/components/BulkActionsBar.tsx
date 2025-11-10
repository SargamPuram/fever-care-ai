import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
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
import { toast } from "sonner";

interface BulkActionsBarProps {
  selectedCount: number;
  selectedPatientIds: string[];
  onClearSelection: () => void;
  onExport: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  selectedPatientIds,
  onClearSelection,
  onExport,
}: BulkActionsBarProps) => {
  const handleMarkReviewed = () => {
    toast.success(`Marked ${selectedCount} patients as reviewed`);
    onClearSelection();
  };

  const handleSendReminder = () => {
    toast.success(`Sent reminders to ${selectedCount} patients`);
    onClearSelection();
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-card border-2 border-primary shadow-elegant rounded-lg p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <Badge variant="default" className="text-sm">
            {selectedCount} Selected
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark Reviewed
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark as Reviewed?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will mark {selectedCount} patient(s) as reviewed. This action can be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMarkReviewed}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button size="sm" variant="outline" className="gap-2" onClick={handleSendReminder}>
            <Mail className="h-4 w-4" />
            Send Reminder
          </Button>

          <Button size="sm" variant="outline" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export Selected
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button size="sm" variant="ghost" onClick={onClearSelection} className="gap-2">
          <XCircle className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
