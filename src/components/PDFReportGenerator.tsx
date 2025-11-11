import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface PDFReportGeneratorProps {
  patientId: string;
  patientName: string;
}

export const PDFReportGenerator = ({ patientId, patientName }: PDFReportGeneratorProps) => {
  const generatePDF = async () => {
    try {
      toast.info("Generating PDF report...");

      // Fetch all patient data
      const [patientResult, tempResult, symptomsResult, medsResult] = await Promise.all([
        supabase.from("patients").select("*").eq("id", patientId).single(),
        supabase
          .from("temperature_readings")
          .select("*")
          .eq("patient_id", patientId)
          .order("recorded_at", { ascending: false })
          .limit(30),
        supabase
          .from("symptoms")
          .select("*")
          .eq("patient_id", patientId)
          .order("recorded_at", { ascending: false })
          .limit(20),
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", patientId)
          .order("prescribed_date", { ascending: false }),
      ]);

      if (patientResult.error) throw patientResult.error;

      const patient = patientResult.data;
      const temperatures = tempResult.data || [];
      const symptoms = symptomsResult.data || [];
      const medications = medsResult.data || [];

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185);
      doc.text("FieveAI Medical Report", pageWidth / 2, yPos, { align: "center" });
      
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${format(new Date(), "PPpp")}`, pageWidth / 2, yPos, { align: "center" });

      // Patient Information
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Patient Information", 14, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.text(`Name: ${patient.full_name}`, 14, yPos);
      yPos += 5;
      doc.text(`Age: ${patient.age || "N/A"}`, 14, yPos);
      yPos += 5;
      doc.text(`Gender: ${patient.gender || "N/A"}`, 14, yPos);
      yPos += 5;
      doc.text(`Risk Score: ${patient.risk_score}/100`, 14, yPos);
      yPos += 5;
      doc.text(`Status: ${patient.status}`, 14, yPos);
      yPos += 5;
      doc.text(`Phone: ${patient.phone || "N/A"}`, 14, yPos);

      // Temperature Trends
      if (temperatures.length > 0) {
        yPos += 15;
        doc.setFontSize(14);
        doc.text("Recent Temperature Readings", 14, yPos);
        
        yPos += 5;
        const tempData = temperatures.slice(0, 10).map((t) => [
          format(new Date(t.recorded_at), "MMM dd, yyyy HH:mm"),
          `${Number(t.temperature).toFixed(1)}°C`,
          Number(t.temperature) > 37.5 ? "High" : "Normal",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date & Time", "Temperature", "Status"]],
          body: tempData,
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Symptoms Timeline
      if (symptoms.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("Recent Symptoms", 14, yPos);
        
        yPos += 5;
        const symptomsData = symptoms.slice(0, 15).map((s) => [
          format(new Date(s.recorded_at), "MMM dd, yyyy"),
          s.symptom_type,
          `${s.severity}/10`,
          s.notes || "-",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Date", "Symptom", "Severity", "Notes"]],
          body: symptomsData,
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
          columnStyles: {
            3: { cellWidth: 60 },
          },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Medications
      if (medications.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text("Current Medications", 14, yPos);
        
        yPos += 5;
        const medsData = medications.map((m) => [
          m.medication_name,
          m.dosage,
          m.frequency,
          m.is_active ? "Active" : "Inactive",
          format(new Date(m.start_date), "MMM dd, yyyy"),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["Medication", "Dosage", "Frequency", "Status", "Start Date"]],
          body: medsData,
          theme: "striped",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Clinical Summary
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Clinical Summary", 14, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      
      const avgTemp = temperatures.length > 0
        ? (temperatures.reduce((sum, t) => sum + Number(t.temperature), 0) / temperatures.length).toFixed(1)
        : "N/A";
      
      const highTempCount = temperatures.filter((t) => Number(t.temperature) > 37.5).length;
      const recentSymptoms = symptoms.slice(0, 5).map((s) => s.symptom_type).join(", ");

      doc.text(`Average Temperature (last 30 readings): ${avgTemp}°C`, 14, yPos);
      yPos += 5;
      doc.text(`High Temperature Readings: ${highTempCount} out of ${temperatures.length}`, 14, yPos);
      yPos += 5;
      doc.text(`Recent Symptoms: ${recentSymptoms || "None recorded"}`, 14, yPos);
      yPos += 5;
      doc.text(`Active Medications: ${medications.filter((m) => m.is_active).length}`, 14, yPos);

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          "FieveAI - Confidential Medical Report",
          pageWidth / 2,
          doc.internal.pageSize.height - 5,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`${patientName.replace(/\s+/g, "_")}_Medical_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF report generated successfully!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <Button onClick={generatePDF} variant="outline">
      <FileText className="h-4 w-4 mr-2" />
      Generate PDF Report
    </Button>
  );
};