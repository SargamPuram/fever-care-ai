import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, AlertTriangle, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
  patient_id: string;
  alert_type: string;
}

interface RealTimeAlertsProps {
  onAlertCountChange?: (count: number) => void;
}

export const RealTimeAlerts = ({ onAlertCountChange }: RealTimeAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    const unreadCount = alerts.filter(a => !a.is_read).length;
    onAlertCountChange?.(unreadCount);
  }, [alerts, onAlertCountChange]);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setAlerts(data);
    }
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('realtime-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setAlerts(prev => [newAlert, ...prev]);
          
          // Show toast notification based on severity
          const toastOptions = {
            description: newAlert.message,
            duration: 5000,
          };

          if (newAlert.severity === "critical") {
            toast.error(`Critical Alert`, toastOptions);
          } else if (newAlert.severity === "high") {
            toast.error(`High Priority Alert`, toastOptions);
          } else {
            toast.info(`New Alert`, toastOptions);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", alertId);

    if (!error) {
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
      toast.success("Alert marked as read");
    }
  };

  const dismissAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", alertId);

    if (!error) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success("Alert dismissed");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "moderate":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <Card className="p-6 border-2 border-border animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Real-Time Alerts
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts at this time
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all animate-slide-up ${
                  alert.is_read
                    ? "bg-muted/30 border-border"
                    : "bg-accent/10 border-accent/50"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 ${
                        alert.severity === "critical"
                          ? "text-destructive"
                          : alert.severity === "high"
                          ? "text-accent"
                          : "text-primary"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(alert.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm ${alert.is_read ? "text-muted-foreground" : "font-medium"}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {alert.alert_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
