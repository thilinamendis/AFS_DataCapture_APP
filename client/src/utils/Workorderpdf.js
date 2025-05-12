import jsPDF from "jspdf";

export const generateWorkOrderPDF = (workOrder) => {
  const doc = new jsPDF();
  const margin = 15;
  const labelWidth = 90;
  const lineHeight = 8;
  let y = margin;

  const pageHeight = doc.internal.pageSize.getHeight();

  const addHeader = (title = "CONFINED SPACE EVALUATION FORM") => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
    y += 10;
  };

  const addField = (label, value, options = {}) => {
    const v = value !== undefined && value !== null && String(value).trim() !== "" ? String(value) : "N/A";

    // Handle Yes/No/NA formatting
    if (options.isYesNo) {
      const display = v === "Y" ? "Yes" : v === "N" ? "No" : "N/A";
      doc.setFont("helvetica", "bold");
      doc.text(`${label}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(display, margin + labelWidth, y);
    } else {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}`, margin, y);
      doc.setFont("helvetica", "normal");

      const split = doc.splitTextToSize(v, 180);
      doc.text(split, margin + labelWidth, y);
      y += (split.length - 1) * lineHeight;
    }

    y += lineHeight;
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addCommentBox = (label, text = "") => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    const boxHeight = 20;
    doc.rect(margin, y, doc.internal.pageSize.getWidth() - 2 * margin, boxHeight);
    const wrapped = doc.splitTextToSize(text || " ", doc.internal.pageSize.getWidth() - 2 * margin - 4);
    doc.text(wrapped, margin + 2, y + 5);

    y += boxHeight + lineHeight;
  };

  const addSectionTitle = (title) => {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(title, margin, y);
    y += lineHeight;
  };

  const addCheckboxGrid = (title, items) => {
    addSectionTitle(title);
    const cols = 3;
    const colWidth = (doc.internal.pageSize.getWidth() - 2 * margin) / cols;
    let col = 0;

    items.forEach((item, index) => {
      const text = item.label;
      const checked = item.checked ? "✔" : "";
      doc.text(`${checked} ${text}`, margin + col * colWidth, y);
      col++;
      if (col >= cols) {
        col = 0;
        y += lineHeight;
      }
    });

    if (col !== 0) y += lineHeight;
  };

  // ========== HEADER ==========
  addHeader();

  addField("Building", workOrder.building);
  addField("Date", workOrder.dateOfSurvey ? new Date(workOrder.dateOfSurvey).toLocaleDateString() : undefined);
  addField("Space Description", workOrder.locationDescription);
  addField("Surveyor", workOrder.surveyors);
  addField("Location", workOrder.location);
  addField("Permit Space", workOrder.isPermitRequired, { isYesNo: true });

  addCommentBox("Brief Description of Space", workOrder.description);

  // ========== Confined Space Characteristics ==========
  addSectionTitle("Confined Space Characteristics");

  addField("Adequate Size & Entry", workOrder.adequateSizeEntry, { isYesNo: true });
  addField("Restricted Means of Entry/Exit", workOrder.restrictedEntry, { isYesNo: true });
  addField("Not Designed for Continuous Occupancy", workOrder.notForContinuousOccupancy, { isYesNo: true });

  // ========== Permit-Required Characteristics ==========
  addSectionTitle("Permit-Required Confined Space Characteristics");

  addField("Hazardous Atmosphere", workOrder.hasAtmosphericHazard, { isYesNo: true });
  addField("If Yes, Describe", workOrder.atmosphericHazardDescription);

  addField("Engulfment Hazard", workOrder.hasEngulfmentHazard, { isYesNo: true });
  addField("If Yes, Describe", workOrder.engulfmentHazardDescription);

  addField("Entrapment Risk", workOrder.hasConfigurationHazard, { isYesNo: true });
  addField("If Yes, Describe", workOrder.configurationHazardDescription);

  addField("Other Hazards Present", workOrder.hasOtherHazards, { isYesNo: true });
  addField("If Yes, Describe", workOrder.otherHazardsDescription);

  // ========== Safety Hazards ==========
  addSectionTitle("Safety Hazards");

  addField("Moving Parts or Machinery", workOrder.hasMovingParts, { isYesNo: true });
  addCommentBox("Describe:", workOrder.movingPartsDescription);
  addField("Can be Locked Out", workOrder.movingPartsLockout, { isYesNo: true });

  addField("Electrical Hazards", workOrder.hasElectricalHazards, { isYesNo: true });
  addCommentBox("Describe:", workOrder.electricalHazardsDescription);
  addField("Can be Locked Out", workOrder.electricalLockout, { isYesNo: true });

  addField("Hydraulic/Pneumatic Hazards", workOrder.hasHydraulicHazards, { isYesNo: true });
  addCommentBox("Describe:", workOrder.hydraulicHazardsDescription);
  addField("Can be Eliminated", workOrder.hydraulicElimination, { isYesNo: true });

  addField("Other Safety Hazards", workOrder.hasOtherSafetyHazards, { isYesNo: true });
  addCommentBox("Describe:", workOrder.otherSafetyHazardsDescription);

  addField("Forced Air Ventilation Sufficient", workOrder.isForcedAirVentilationSufficient, { isYesNo: true });
  addCommentBox("Describe:", workOrder.forcedAirDescription);

  addField("Dedicated Air Monitor", workOrder.hasDedicatedAirMonitor, { isYesNo: true });

  // ========== Contained Elements Grid ==========
  addCheckboxGrid("Space Contains:", [
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
  ]);

  addCommentBox("Additional Comments on Items 1–7", workOrder.additionalHazardComments);

  // ========== Photo Log ==========
  addSectionTitle("Photograph Log");
  doc.setFont("helvetica", "bold");
  doc.text("Pic #", margin, y);
  doc.text("Description", margin + 30, y);
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < 3; i++) {
    doc.rect(margin, y, 20, 10);
    doc.rect(margin + 30, y, doc.internal.pageSize.getWidth() - margin * 2 - 30, 10);
    y += 12;
  }

  // ========== Final Details ==========
  addField("Warning Sign Posted", workOrder.hasWarningSign, { isYesNo: true });
  addField("Others Working Nearby", workOrder.hasOtherPeopleWorking, { isYesNo: true });
  addField("Can Others See Space", workOrder.canOthersSeeIntoSpace, { isYesNo: true });
  addCommentBox("Describe:", workOrder.otherPeopleDescription);

  addField("Employees Need Entry?", workOrder.doEmployeesEnter, { isYesNo: true });
  addField("Contractors Enter?", workOrder.doContractorsEnter, { isYesNo: true });
  addCommentBox("Describe:", workOrder.contractorWorkDescription);

  addField("Normally Locked?", workOrder.isLocked, { isYesNo: true });
  addCommentBox("Describe:", workOrder.lockDescription);

  addField("Entry Points", workOrder.numberOfEntryPoints);
  addCommentBox("Describe:", workOrder.entryPointDescription);

  addCommentBox("Reasons for Entering", workOrder.reasonForEntry);
  addCommentBox("Routine Activities", workOrder.routineActivities);
  addCommentBox("Non-Routine Activities", workOrder.nonRoutineActivities);
  addCommentBox("Rescue Considerations", workOrder.rescueConsiderations);
  addCommentBox("Other Comments/Notes", workOrder.notes);

  // ========== Footer ==========
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save(`ConfinedSpace_Evaluation_${workOrder._id || "form"}.pdf`);
};
