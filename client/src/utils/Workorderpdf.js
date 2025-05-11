import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateWorkOrderPDF = (workOrder) => {
  const doc = new jsPDF();
  const margin = 15;

  doc.setFontSize(14);
  doc.text("CONFINED SPACE EVALUATION FORM", doc.internal.pageSize.getWidth() / 2, margin, { align: "center" });

  doc.setFontSize(10);
  const sectionGap = 8;
  let y = margin + 10;

  const drawTextBlock = (title, content) => {
    doc.setFont(undefined, "bold");
    doc.text(title, margin, y);
    doc.setFont(undefined, "normal");
    doc.text(content || "N/A", margin + 50, y);
    y += 7;
  };

  const yesNo = (value) => value === "Y" ? "Yes" : "No";

  // Top Info
  drawTextBlock("Building", workOrder.building);
  drawTextBlock("Date", new Date(workOrder.dateOfSurvey).toLocaleDateString());
  drawTextBlock("Space Description", workOrder.confinedSpaceDescription);
  drawTextBlock("Surveyor", workOrder.surveyors);
  drawTextBlock("Location", workOrder.locationDescription);
  drawTextBlock("Permit Space", yesNo(workOrder.isPermitRequired));

  y += sectionGap;

  doc.setFont(undefined, "bold");
  doc.text("Confined Space Characteristics", margin, y);
  y += 6;
  doc.setFont(undefined, "normal");

  const spaceCharacteristics = [
    ["Adequate size to bodily enter?", yesNo(workOrder.isConfinedSpace)],
    ["Restricted entry/exit?", yesNo(workOrder.isConfinedSpace)],
    ["Not designed for continuous occupancy?", yesNo(workOrder.isConfinedSpace)],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Question", "Answer"]],
    body: spaceCharacteristics,
    theme: "grid",
    styles: { fontSize: 9 },
    margin: { left: margin },
  });

  y = doc.previousAutoTable.finalY + sectionGap;

  doc.setFont(undefined, "bold");
  doc.text("Permit-Required Confined Space Characteristics", margin, y);
  y += 6;
  doc.setFont(undefined, "normal");

  const permitSpaceCharacteristics = [
    ["Hazardous atmosphere?", yesNo(workOrder.hasAtmosphericHazard)],
    ["If Yes, Describe:", workOrder.atmosphericHazardDescription || "N/A"],
    ["Engulfment hazard?", yesNo(workOrder.hasEngulfmentHazard)],
    ["If Yes, Describe:", workOrder.engulfmentHazardDescription || "N/A"],
    ["Entrapment/asphyxiation hazard?", yesNo(workOrder.hasConfigurationHazard)],
    ["If Yes, Describe:", workOrder.configurationHazardDescription || "N/A"],
    ["Other serious hazards?", yesNo(workOrder.hasOtherHazards)],
    ["If Yes, Describe:", workOrder.otherHazardsDescription || "N/A"],
  ];

  autoTable(doc, {
    startY: y,
    body: permitSpaceCharacteristics.map(row => [row[0], row[1]]),
    theme: "grid",
    styles: { fontSize: 9 },
    margin: { left: margin },
  });

  y = doc.previousAutoTable.finalY + sectionGap;

  const additionalQuestions = [
    ["PPE Required?", yesNo(workOrder.requiresPPE)],
    ["PPE List", workOrder.ppeList || "N/A"],
    ["Forced Air Ventilation Sufficient?", yesNo(workOrder.isForcedAirVentilationSufficient)],
    ["Dedicated Continuous Air Monitor?", yesNo(workOrder.hasDedicatedAirMonitor)],
    ["Warning Sign Posted?", yesNo(workOrder.hasWarningSign)],
    ["Other People Working Near?", yesNo(workOrder.hasOtherPeopleWorking)],
    ["Can Others See Into Space?", yesNo(workOrder.canOthersSeeIntoSpace)],
    ["Do Contractors Enter?", yesNo(workOrder.doContractorsEnter)],
    ["Number of Entry Points", String(workOrder.numberOfEntryPoints || "N/A")],
    ["Notes", workOrder.notes || "N/A"],
  ];

  doc.setFont(undefined, "bold");
  doc.text("Safety & Access Considerations", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    body: additionalQuestions.map(row => [row[0], row[1]]),
    theme: "grid",
    styles: { fontSize: 9 },
    margin: { left: margin },
  });

  // Save file
  doc.save(`WorkOrder_${workOrder._id}.pdf`);
};
