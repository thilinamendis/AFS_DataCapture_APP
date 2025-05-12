import jsPDF from "jspdf";

export const generateWorkOrderPDF = (workOrder) => {
  const doc = new jsPDF();
  const margin = 15;
  let lineSpacing = 10; // Increased for better readability
  let y = margin;
  const valueIndent = margin + 85; // Indentation for field values

  // Helper function to add a new page if needed
  const addNewPageIfNeeded = (currentY, spaceNeeded) => {
    if (currentY + spaceNeeded > doc.internal.pageSize.getHeight() - margin - 20) { // Reserve space for footer
      doc.addPage();
      currentY = margin;
      // Add continued header
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0); // Black
      doc.text("Work Order Report (Continued)", doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
      currentY += 15; // Space after continued header
    }
    return currentY;
  };

  // Header
  doc.setFontSize(24);
  doc.setTextColor(0.051 * 255, 0.431 * 255, 0.992 * 255); // Approximate blue color
  doc.text("A.F.S", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Black
  doc.text("Work Order Report", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100); // Grey
    doc.text(`Work Order ID: ${workOrder.workOrderId || 'N/A'}`, margin, y);
    y += 7;
    doc.text('Generated on:', margin, y);
    y += 7;
    doc.text(new Date().toLocaleDateString(), margin, y, { align: "center" });
  y += 15;

  doc.setTextColor(0, 0, 0); // Reset to black for content

  const sections = [
    {
      title: "General Information",
      fields: [
        { label: "Work Order ID", value: workOrder.workOrderId },
        { label: "Title", value: workOrder.title },
        { label: "Description", value: workOrder.description },
        { label: "Status", value: workOrder.status },
        { label: "Priority", value: workOrder.priority },
        { label: "Due Date", value: workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : undefined },
      ],
    },
    {
      title: "Customer Information",
      fields: [
        { label: "Customer Name", value: workOrder.customerName },
        { label: "Customer Contact", value: workOrder.customerContact },
      ],
    },
    {
      title: "Survey & Location Details",
      fields: [
        { label: "Date of Survey", value: workOrder.dateOfSurvey ? new Date(workOrder.dateOfSurvey).toLocaleDateString() : undefined },
        { label: "Surveyors", value: workOrder.surveyors },
        { label: "Location", value: workOrder.location },
        { label: "Building", value: workOrder.building },
        { label: "Location Description", value: workOrder.locationDescription },
      ],
    },
    {
      title: "Confined Space Identification & Permitting",
      fields: [
        { label: "Confined Space Name/ID", value: workOrder.confinedSpaceNameId },
        { label: "Confined Space Description", value: workOrder.confinedSpaceDescription },
        { label: "Is Confined Space", value: workOrder.isConfinedSpace === "Y" ? "Yes" : workOrder.isConfinedSpace === "N" ? "No" : undefined },
        { label: "Permit Required", value: workOrder.isPermitRequired === "Y" ? "Yes" : workOrder.isPermitRequired === "N" ? "No" : undefined },
        { label: "Entry Requirements", value: workOrder.entryRequirements },
        { label: "Number of Entry Points", value: workOrder.numberOfEntryPoints },
      ],
    },
    {
      title: "Hazard Assessment",
      fields: [
        { label: "Atmospheric Hazard", value: workOrder.hasAtmosphericHazard === "Y" ? "Yes" : workOrder.hasAtmosphericHazard === "N" ? "No" : undefined },
        { label: "Atmospheric Hazard Description", value: workOrder.atmosphericHazardDescription },
        { label: "Engulfment Hazard", value: workOrder.hasEngulfmentHazard === "Y" ? "Yes" : workOrder.hasEngulfmentHazard === "N" ? "No" : undefined },
        { label: "Engulfment Hazard Description", value: workOrder.engulfmentHazardDescription },
        { label: "Configuration Hazard", value: workOrder.hasConfigurationHazard === "Y" ? "Yes" : workOrder.hasConfigurationHazard === "N" ? "No" : undefined },
        { label: "Configuration Hazard Description", value: workOrder.configurationHazardDescription },
        { label: "Other Hazards", value: workOrder.hasOtherHazards === "Y" ? "Yes" : workOrder.hasOtherHazards === "N" ? "No" : undefined },
        { label: "Other Hazards Description", value: workOrder.otherHazardsDescription },
      ],
    },
    {
      title: "Safety Measures & Equipment",
      fields: [
        { label: "PPE Required", value: workOrder.requiresPPE === "Y" ? "Yes" : workOrder.requiresPPE === "N" ? "No" : undefined },
        { label: "PPE List", value: workOrder.ppeList },
        { label: "Forced Air Ventilation Sufficient", value: workOrder.isForcedAirVentilationSufficient === "Y" ? "Yes" : workOrder.isForcedAirVentilationSufficient === "N" ? "No" : undefined },
        { label: "Dedicated Air Monitor", value: workOrder.hasDedicatedAirMonitor === "Y" ? "Yes" : workOrder.hasDedicatedAirMonitor === "N" ? "No" : undefined },
        { label: "Warning Sign Posted", value: workOrder.hasWarningSign === "Y" ? "Yes" : workOrder.hasWarningSign === "N" ? "No" : undefined },
      ],
    },
    {
      title: "Operational Considerations",
      fields: [
        { label: "Other People Working Near Space", value: workOrder.hasOtherPeopleWorking === "Y" ? "Yes" : workOrder.hasOtherPeopleWorking === "N" ? "No" : undefined },
        { label: "Can Others See into Space", value: workOrder.canOthersSeeIntoSpace === "Y" ? "Yes" : workOrder.canOthersSeeIntoSpace === "N" ? "No" : undefined },
        { label: "Do Contractors Enter Space", value: workOrder.doContractorsEnter === "Y" ? "Yes" : workOrder.doContractorsEnter === "N" ? "No" : undefined },
      ],
    },
    {
      title: "Additional Notes",
      fields: [
        { label: "Notes", value: workOrder.notes },
      ],
    },
  ];

  let totalFieldsCount = 0;

  sections.forEach((section, sectionIndex) => {
    if (section.fields.every(f => f.value === undefined || f.value === null || String(f.value).trim() === '')) {
      return; // Skip empty sections
    }

    const sectionTitleFontHeight = 14 * doc.getLineHeightFactor();
    const spaceForSectionTitle = sectionTitleFontHeight + lineSpacing;
    
    y = addNewPageIfNeeded(y, spaceForSectionTitle);

    if (y > margin + 25) { // Add space before section title if not at the very top of a new page
        y += lineSpacing * 0.75;
    }

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(80, 80, 80); // Dark grey for section titles
    doc.text(section.title, margin, y);
    y += sectionTitleFontHeight;
    y += lineSpacing * 0.25; // Smaller space after section title
    doc.setTextColor(0, 0, 0); // Reset text color

    section.fields.forEach(field => {
      const valueToDisplay = field.value !== undefined && field.value !== null && String(field.value).trim() !== '' ? String(field.value) : "N/A";
      
      // Skip fields that would only display "N/A" if they were originally empty/undefined, unless it's a boolean "No"
      if (valueToDisplay === "N/A" && (field.value === undefined || field.value === null || String(field.value).trim() === '')) {
          // Exception for boolean fields that correctly evaluate to "No" which becomes "N/A" if not handled
          const isExplicitNo = (
              field.label.includes("Hazard") || field.label.includes("Required") || field.label.includes("Sufficient") ||
              field.label.includes("Monitor") || field.label.includes("Posted") || field.label.includes("Space")
            ) && field.value === "N"; // Example: workOrder.isPermitRequired === "N" results in "No"
          if (!isExplicitNo && !(field.value === false)) { // also keep if original value was false
             // Allow "N/A" for genuinely missing optional fields or explicitly set N/A
          }
      }


      doc.setFontSize(11);
      const fieldLineHeight = doc.getLineHeightFactor() * 11;
      const labelText = `${field.label}:`;
      
      const tempSplitValue = doc.splitTextToSize(valueToDisplay, doc.internal.pageSize.getWidth() - valueIndent - margin);
      const requiredHeightForField = Math.max(1, tempSplitValue.length) * fieldLineHeight + (lineSpacing * 0.5);

      y = addNewPageIfNeeded(y, requiredHeightForField);

      doc.setFont(undefined, 'bold');
      doc.text(labelText, margin, y); // Draw label

      doc.setFont(undefined, 'normal');
      doc.text(tempSplitValue, valueIndent, y); // Draw value

      y += Math.max(1, tempSplitValue.length) * fieldLineHeight;
      y += lineSpacing * 0.5; // Padding after field
      totalFieldsCount++;
    });
    y += lineSpacing * 0.25; // Add a bit of extra space after a section's fields
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    if (i === pageCount) {
        doc.text(`Total Fields Displayed: ${totalFieldsCount}`, margin, doc.internal.pageSize.getHeight() - 20);
    }
  }

  // Save file
  doc.save(`WorkOrder_Report_${workOrder._id || 'details'}.pdf`);
};