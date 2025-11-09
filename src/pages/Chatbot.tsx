import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [patientId, setPatientId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: patient } = await supabase
        .from("patients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (patient) {
        setPatientId(patient.id);
        loadMessages(patient.id);
      }
    };

    fetchPatient();
  }, [navigate]);

  const loadMessages = async (pid: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("patient_id", pid)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !patientId) return;

    const userMessage = {
      patient_id: patientId,
      role: "user" as const,
      content: input,
      language,
    };

    setMessages((prev) => [...prev, { ...userMessage, created_at: new Date().toISOString() }]);
    setInput("");
    setLoading(true);

    try {
      await supabase.from("chat_messages").insert([userMessage]);

      // Call AI edge function
      const { data: aiData, error: aiError } = await supabase.functions.invoke('chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          language 
        }
      });

      if (aiError) {
        throw aiError;
      }

      const aiResponse = {
        patient_id: patientId,
        role: "assistant" as const,
        content: aiData.message,
        language,
      };

      await supabase.from("chat_messages").insert([aiResponse]);
      setMessages((prev) => [...prev, { ...aiResponse, created_at: new Date().toISOString() }]);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-light to-background">
      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/patient")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">AI Symptom Assistant</h1>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
