import jsPDF from "jspdf";

export const generateWorkOrderPDF = (workOrder) => {
  const doc = new jsPDF();
  const margin = 15;
  const tableWidth = 180;
  const labelWidth = 60;
  const valueWidth = 120;
  const rowHeight = 11;
  let y = 25;

  // Premium Grayscale Colors
  const headerFooterBg = [40, 40, 40];
  const sectionBg = [210, 210, 210];
  const rowBg = [245, 245, 245];
  const borderColor = [120, 120, 120];
  const textDark = [0, 0, 0];
  const textLight = [255, 255, 255];

  // Header
  doc.setFillColor(...headerFooterBg);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFontSize(16);
  doc.setTextColor(...textLight);
  doc.setFont("helvetica", "bold");
  doc.text("A.F.S - CONFINED SPACE EVALUATION FORM", 105, 13, { align: "center" });

  // Table header row
  doc.setFillColor(...sectionBg);
  doc.setDrawColor(...borderColor);
  doc.rect(margin, y, tableWidth, rowHeight, 'F');
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text("Field", margin + 2, y + 7);
  doc.text("Value", margin + labelWidth + 2, y + 7);
  y += rowHeight;

  // Helper: Draw a checkbox
  const drawCheckbox = (checked, x, y) => {
    doc.setDrawColor(...borderColor);
    doc.rect(x, y, 5, 5);
    if (checked) {
      doc.setFontSize(12);
      doc.setTextColor(...textDark);
      doc.text("✔", x + 1, y + 4.5);
    }
    doc.setTextColor(...textDark);
  };

  // Helper: Add a table row
  const addTableRow = (label, value, isCheckbox, isAltRow) => {
    // Background
    if (isAltRow) {
      doc.setFillColor(...rowBg);
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
    }
    // Borders
    doc.setDrawColor(...borderColor);
    doc.rect(margin, y, tableWidth, rowHeight);
    doc.line(margin + labelWidth, y, margin + labelWidth, y + rowHeight);
    // Label
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(label, margin + 2, y + 7);
    // Value
    doc.setFont("helvetica", "normal");
    if (isCheckbox) {
      ["Y", "N", "NA"].forEach((v, i) => {
        drawCheckbox(value === v, margin + labelWidth + 10 + i * 18, y + 3);
        doc.setFontSize(10);
        doc.text(v, margin + labelWidth + 17 + i * 18, y + 8);
      });
    } else {
      const v = value !== undefined && value !== null && String(value).trim() !== "" ? String(value) : "N/A";
      const split = doc.splitTextToSize(v, valueWidth - 10);
      doc.text(split, margin + labelWidth + 2, y + 7);
    }
    y += rowHeight;
    if (y > 265) { doc.addPage(); y = 25; }
  };

  // Helper: Add a section header row
  const addSectionHeader = (title) => {
    doc.setFillColor(...sectionBg);
    doc.setDrawColor(...borderColor);
    doc.rect(margin, y, tableWidth, rowHeight, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textDark);
    doc.text(title, margin + 2, y + 8);
    y += rowHeight;
    if (y > 265) { doc.addPage(); y = 25; }
  };

  // Table content
  let alt = false;
  addSectionHeader("Basic Information");
  addTableRow("Building", workOrder.building, false, alt = !alt);
  addTableRow("Date", workOrder.dateOfSurvey ? new Date(workOrder.dateOfSurvey).toLocaleDateString() : undefined, false, alt = !alt);
  addTableRow("Space Description", workOrder.locationDescription, false, alt = !alt);
  addTableRow("Surveyor", workOrder.surveyors, false, alt = !alt);
  addTableRow("Location", workOrder.location, false, alt = !alt);
  addTableRow("Permit Space", workOrder.isPermitRequired, true, alt = !alt);
  addTableRow("Brief Description of Space", workOrder.description, false, alt = !alt);

  addSectionHeader("Confined Space Characteristics");
  addTableRow("Adequate Size & Entry", workOrder.adequateSizeEntry, true, alt = !alt);
  addTableRow("Restricted Means of Entry/Exit", workOrder.restrictedEntry, true, alt = !alt);
  addTableRow("Not Designed for Continuous Occupancy", workOrder.notForContinuousOccupancy, true, alt = !alt);

  addSectionHeader("Permit-Required Confined Space Characteristics");
  addTableRow("Hazardous Atmosphere", workOrder.hasAtmosphericHazard, true, alt = !alt);
  addTableRow("If Yes, Describe", workOrder.atmosphericHazardDescription, false, alt = !alt);
  addTableRow("Engulfment Hazard", workOrder.hasEngulfmentHazard, true, alt = !alt);
  addTableRow("If Yes, Describe", workOrder.engulfmentHazardDescription, false, alt = !alt);
  addTableRow("Entrapment Risk", workOrder.hasConfigurationHazard, true, alt = !alt);
  addTableRow("If Yes, Describe", workOrder.configurationHazardDescription, false, alt = !alt);
  addTableRow("Other Hazards Present", workOrder.hasOtherHazards, true, alt = !alt);
  addTableRow("If Yes, Describe", workOrder.otherHazardsDescription, false, alt = !alt);

  addSectionHeader("Safety Hazards");
  addTableRow("Moving Parts or Machinery", workOrder.hasMovingParts, true, alt = !alt);
  addTableRow("Describe Moving Parts", workOrder.movingPartsDescription, false, alt = !alt);
  addTableRow("Can be Locked Out", workOrder.movingPartsLockout, true, alt = !alt);
  addTableRow("Electrical Hazards", workOrder.hasElectricalHazards, true, alt = !alt);
  addTableRow("Describe Electrical Hazards", workOrder.electricalHazardsDescription, false, alt = !alt);
  addTableRow("Can be Locked Out", workOrder.electricalLockout, true, alt = !alt);
  addTableRow("Hydraulic/Pneumatic Hazards", workOrder.hasHydraulicHazards, true, alt = !alt);
  addTableRow("Describe Hydraulic/Pneumatic Hazards", workOrder.hydraulicHazardsDescription, false, alt = !alt);
  addTableRow("Can be Eliminated", workOrder.hydraulicElimination, true, alt = !alt);
  addTableRow("Other Safety Hazards", workOrder.hasOtherSafetyHazards, true, alt = !alt);
  addTableRow("Describe Other Safety Hazards", workOrder.otherSafetyHazardsDescription, false, alt = !alt);
  addTableRow("Forced Air Ventilation Sufficient", workOrder.isForcedAirVentilationSufficient, true, alt = !alt);
  addTableRow("Describe Forced Air Ventilation", workOrder.forcedAirDescription, false, alt = !alt);
  addTableRow("Dedicated Air Monitor", workOrder.hasDedicatedAirMonitor, true, alt = !alt);

  addSectionHeader("Space Contains");
  // Grid of checkboxes for contained elements
  const gridItems = [
    { label: "Gas Lines", checked: workOrder.containsGasLines === "Y" },
    { label: "Chemical Lines", checked: workOrder.containsChemicalLines === "Y" },
    { label: "Pipes", checked: workOrder.containsPipes === "Y" },
    { label: "Extreme Heat", checked: workOrder.containsExtremeHeat === "Y" },
    { label: "Extreme Cold", checked: workOrder.containsExtremeCold === "Y" },
    { label: "Valves", checked: workOrder.containsValves === "Y" },
    { label: "Poor Lighting", checked: workOrder.containsPoorLighting === "Y" },
    { label: "Sludge/Residue", checked: workOrder.containsSludge === "Y" },
    { label: "Falling Objects", checked: workOrder.containsFallingObjects === "Y" },
    { label: "Steam Lines", checked: workOrder.containsSteamLines === "Y" },
    { label: "Poor Communication", checked: workOrder.containsPoorCommunication === "Y" },
    { label: "Sharp Objects", checked: workOrder.containsSharpObjects === "Y" },
    { label: "Pressure/Vacuum", checked: workOrder.containsPressure === "Y" },
    { label: "Sloping Surfaces", checked: workOrder.containsSlopes === "Y" },
    { label: "Radiation", checked: workOrder.containsRadiation === "Y" },
    { label: "Elevations", checked: workOrder.containsElevations === "Y" },
  ];
  let gridY = y;
  let gridCol = 0;
  for (let i = 0; i < gridItems.length; i++) {
    const item = gridItems[i];
    const x = margin + gridCol * 60;
    drawCheckbox(item.checked, x, gridY + 3);
    doc.setFontSize(10);
    doc.text(item.label, x + 7, gridY + 8);
    gridCol++;
    if (gridCol === 3) {
      gridCol = 0;
      gridY += rowHeight;
    }
  }
  y = gridY + rowHeight + 2;

  addTableRow("Additional Comments on Items 1–7", workOrder.additionalHazardComments, false, alt = !alt);

  addSectionHeader("Photograph Log");
  doc.setFont("helvetica", "bold");
  doc.text("Pic #", margin, y + 7);
  doc.text("Description", margin + 30, y + 7);
  y += rowHeight;
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < 3; i++) {
    doc.roundedRect(margin, y, 20, 10, 2, 2);
    doc.roundedRect(margin + 30, y, 150, 10, 2, 2);
    y += 12;
    if (y > 265) { doc.addPage(); y = 25; }
  }

  addSectionHeader("Final Details");
  addTableRow("Warning Sign Posted", workOrder.hasWarningSign, true, alt = !alt);
  addTableRow("Others Working Nearby", workOrder.hasOtherPeopleWorking, true, alt = !alt);
  addTableRow("Can Others See Space", workOrder.canOthersSeeIntoSpace, true, alt = !alt);
  addTableRow("Describe Other People", workOrder.otherPeopleDescription, false, alt = !alt);
  addTableRow("Employees Need Entry?", workOrder.doEmployeesEnter, true, alt = !alt);
  addTableRow("Contractors Enter?", workOrder.doContractorsEnter, true, alt = !alt);
  addTableRow("Describe Contractors", workOrder.contractorWorkDescription, false, alt = !alt);
  addTableRow("Normally Locked?", workOrder.isLocked, true, alt = !alt);
  addTableRow("Describe Lock", workOrder.lockDescription, false, alt = !alt);
  addTableRow("Entry Points", workOrder.numberOfEntryPoints, false, alt = !alt);
  addTableRow("Describe Entry Points", workOrder.entryPointDescription, false, alt = !alt);
  addTableRow("Reasons for Entering", workOrder.reasonForEntry, false, alt = !alt);
  addTableRow("Routine Activities", workOrder.routineActivities, false, alt = !alt);
  addTableRow("Non-Routine Activities", workOrder.nonRoutineActivities, false, alt = !alt);
  addTableRow("Rescue Considerations", workOrder.rescueConsiderations, false, alt = !alt);
  addTableRow("Other Comments/Notes", workOrder.notes, false, alt = !alt);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...headerFooterBg);
    doc.rect(0, 287, 210, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...textLight);
    doc.text(`A.F.S - Page ${i} of ${pageCount}`, 105, 293, { align: 'center' });
  }

  doc.save(`ConfinedSpace_Evaluation_${workOrder._id || "form"}.pdf`);
};
