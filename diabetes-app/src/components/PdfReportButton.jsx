import React from "react";
import { Button } from "@mui/material";
import jsPDF from "jspdf";

export default function PdfReportButton({ result, trend, feedback }) {
  const handlePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("당뇨병 예측 리포트", 20, 20);
    doc.setFontSize(12);
    let y = 35;
    if (result) {
      doc.text(`위험도: ${result.risk}% (${result.interpretation})`, 20, y);
      y += 10;
      doc.text("주요 변화 요인:", 20, y);
      y += 8;
      (result.shap || []).slice(0, 5).forEach((s, i) => {
        doc.text(`- ${s.feature}: ${s.impact.toFixed(2)}`, 24, y + i * 7);
      });
      y += 40;
    }
    if (trend && trend.length) {
      doc.text("월별 위험도 트렌드:", 20, y);
      y += 8;
      trend.forEach((t, i) => {
        doc.text(`${t.month}: ${(t.avg_prob * 100).toFixed(1)}% (${t.count}건)`, 24, y + i * 7);
      });
      y += trend.length * 7 + 10;
    }
    if (feedback) {
      doc.text("맞춤 피드백:", 20, y);
      y += 8;
      doc.text(feedback, 24, y);
    }
    doc.save("diabetes_report.pdf");
  };
  return (
    <Button variant="outlined" color="primary" onClick={handlePdf} sx={{ mt: 2 }}>
      PDF/리포트 저장
    </Button>
  );
} 