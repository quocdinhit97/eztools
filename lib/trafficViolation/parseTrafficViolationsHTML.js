import * as cheerio from "cheerio";

// ============================================================================
// FIELD MAPPING CONFIGURATION
// ============================================================================

const FIELD_MAPPINGS = {
  "Biển kiểm soát:": "licensePlate",
  "Màu biển:": "plateColor",
  "Loại phương tiện:": "vehicleType",
  "Thời gian vi phạm:": "violationTime",
  "Địa điểm vi phạm:": "violationLocation",
  "Hành vi vi phạm:": "violationBehavior",
  "Trạng thái:": "status",
  "Đơn vị phát hiện vi phạm:": "detectionUnit",
};

const RESOLUTION_PATTERNS = {
  NAME_PREFIX: /^[0-9]+\./,
  ADDRESS_LABEL: "Địa chỉ:",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractFieldData($element) {
  const label = $element.find("label span").text().trim();
  const value = $element.find(".col-md-9").text().trim();
  return { label, value };
}

function isViolationBoundary($element) {
  return $element.next().is("hr") || $element.prev().is("hr");
}

function mapLabelToField(label) {
  return FIELD_MAPPINGS[label] || null;
}

function isResolutionPlaceName(text) {
  return RESOLUTION_PATTERNS.NAME_PREFIX.test(text);
}

function isResolutionPlaceAddress(text) {
  return text.startsWith(RESOLUTION_PATTERNS.ADDRESS_LABEL);
}

function parseAddress(text) {
  return text.replace(RESOLUTION_PATTERNS.ADDRESS_LABEL, "").trim();
}

function hasViolationData(violation) {
  return Object.keys(violation).length > 0;
}

function finalizeViolation(violation, resolutionPlaces) {
  return {
    ...violation,
    resolutionPlaces: [...resolutionPlaces],
  };
}

// ============================================================================
// MAIN PARSER
// ============================================================================

export function parseTrafficViolationsHTML(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const allViolations = [];
  let currentViolation = {};
  let currentResolutionPlaces = [];

  $(".form-group").each((_, element) => {
    const $el = $(element);
    const { label, value } = extractFieldData($el);

    if (isViolationBoundary($el)) {
      if (hasViolationData(currentViolation)) {
        allViolations.push(finalizeViolation(currentViolation, currentResolutionPlaces));
        currentViolation = {};
        currentResolutionPlaces = [];
      }
    }

    if (label && value) {
      const fieldKey = mapLabelToField(label);
      if (fieldKey) {
        currentViolation[fieldKey] = value;
      }
    }

    const elementText = $el.text().trim();
    
    if (isResolutionPlaceName(elementText)) {
      currentResolutionPlaces.push({ name: elementText });
    } else if (isResolutionPlaceAddress(elementText)) {
      const lastPlace = currentResolutionPlaces[currentResolutionPlaces.length - 1];
      if (lastPlace) {
        lastPlace.address = parseAddress(elementText);
      }
    }
  });

  if (hasViolationData(currentViolation)) {
    allViolations.push(finalizeViolation(currentViolation, currentResolutionPlaces));
  }

  return allViolations;
}
