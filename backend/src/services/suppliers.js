const { hashString } = require("../utils/cryptoHelper");

/**
 * 3 Demo Suppliers with comprehensive procurement attributes
 * Meets all prompt criteria:
 * - Price, Delivery time, Reputation, Warranty, Payment terms
 */
const DEMO_SUPPLIERS = [
  {
    id: "supp_techsource",
    name: "TechSource Enterprise",
    productCategory: "Laptops & Enterprise Hardware",
    baseUnitPrice: 570, // $570/unit
    deliveryDays: 3,    // Fast 3-day enterprise shipping
    reputation: 4.9,    // 4.9 / 5.0 rating (98%)
    warrantyMonths: 36, // 36-month (3 yr) enterprise warranty
    paymentTerms: "Net 60", // 60 days to pay
    paymentTermsScore: 95,
    inStock: 500,
    complianceStatus: "ISO 9001 / SOC2 Certified"
  },
  {
    id: "supp_globaltech",
    name: "GlobalTech Supplies",
    productCategory: "Laptops & Enterprise Hardware",
    baseUnitPrice: 540, // $540/unit (Lowest raw price)
    deliveryDays: 8,    // 8-day shipping
    reputation: 4.5,    // 4.5 / 5.0 rating (90%)
    warrantyMonths: 24, // 24-month warranty
    paymentTerms: "Net 30", // 30 days to pay
    paymentTermsScore: 80,
    inStock: 250,
    complianceStatus: "ISO 9001 Certified"
  },
  {
    id: "supp_bizhardware",
    name: "Business Hardware Co.",
    productCategory: "Laptops & Enterprise Hardware",
    baseUnitPrice: 610, // $610/unit
    deliveryDays: 2,    // Ultra-fast 2-day delivery
    reputation: 4.7,    // 4.7 / 5.0 rating (94%)
    warrantyMonths: 12, // 12-month standard warranty
    paymentTerms: "Net 15", // 15 days to pay
    paymentTermsScore: 65,
    inStock: 120,
    complianceStatus: "Standard Enterprise Vendor"
  }
];

/**
 * Pre-computes supplierHash for gas-optimized on-chain verification
 */
const ENRICHED_SUPPLIERS = DEMO_SUPPLIERS.map((s) => ({
  ...s,
  supplierHash: hashString(s.name)
}));

function getSuppliers() {
  return ENRICHED_SUPPLIERS;
}

function getSupplierById(id) {
  return ENRICHED_SUPPLIERS.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
}

module.exports = {
  DEMO_SUPPLIERS: ENRICHED_SUPPLIERS,
  getSuppliers,
  getSupplierById
};
