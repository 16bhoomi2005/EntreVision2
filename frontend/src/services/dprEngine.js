/**
 * EntreVision Bank-Grade DPR Financial & Viability Engine
 * ========================================================
 * Follows Indian Banks' Association (IBA), MoFPI (PMFME), and NABARD Project Appraisal Norms.
 * Standardizes:
 * 1. Category-specific operational profiles (Juice, Nursery, Cold Storage, etc.)
 * 2. Proper Separation: Project Cost vs Promoter Equity vs Initial Bank Finance vs Potential Subsidy
 * 3. Back-Ended Subsidy Reserve Fund mechanism (No Day-0 upfront loan deduction)
 * 4. Standard Reducing Balance EMI & Amortization Schedule
 */

// ============================================================================
// 1. INDUSTRY-SPECIFIC OPERATING COST PROFILES
// ============================================================================
export const BUSINESS_FINANCIAL_PROFILES = {
  juice: {
    key: "juice",
    title: "Citrus Juice, Squash & RTS Beverages",
    keywords: ["juice", "beverage", "rts", "squash", "syrup"],
    revenueMultiplier: 2.40,
    costRatios: {
      rawMaterial: 0.44,
      packaging: 0.11,
      electricity: 0.07,
      labour: 0.09,
      maintenance: 0.02,
      admin: 0.03,
    },
    capexSplit: {
      machinery: 0.65,
      civil: 0.20,
      electrification: 0.08,
      installation: 0.04,
      preOperative: 0.03,
    },
    workingCapitalCycle: {
      rawMaterialDays: 21,
      packagingDays: 15,
      finishedGoodsDays: 10,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "PMFME (MoFPI 35% Credit-Linked Capital Subsidy)",
    subsidyRate: 0.35,
    subsidyCap: 1000000,
    promoterMarginRate: 0.10,
  },
  nursery: {
    key: "nursery",
    title: "Certified Disease-Free Citrus Nursery & Budwood Propagation",
    keywords: ["nursery", "propagation", "budwood", "rootstock", "greenhouse"],
    revenueMultiplier: 1.85,
    costRatios: {
      rawMaterial: 0.15,
      packaging: 0.06,
      electricity: 0.05,
      labour: 0.32,
      maintenance: 0.03,
      admin: 0.04,
    },
    capexSplit: {
      machinery: 0.45,
      civil: 0.38,
      electrification: 0.08,
      installation: 0.05,
      preOperative: 0.04,
    },
    workingCapitalCycle: {
      rawMaterialDays: 30,
      packagingDays: 10,
      finishedGoodsDays: 15,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "MIDH / NHM Commercial Horticulture Subsidy",
    subsidyRate: 0.35,
    subsidyCap: 2500000,
    promoterMarginRate: 0.20,
  },
  coldStorage: {
    key: "coldStorage",
    title: "Solar Pre-Cooling & Farm-Gate Controlled Atmosphere Cold Storage",
    keywords: ["cold", "storage", "pre-cooling", "ca store", "warehouse"],
    revenueMultiplier: 1.55,
    costRatios: {
      rawMaterial: 0.04,
      packaging: 0.03,
      electricity: 0.36,
      labour: 0.12,
      maintenance: 0.08,
      admin: 0.05,
    },
    capexSplit: {
      machinery: 0.58,
      civil: 0.28,
      electrification: 0.08,
      installation: 0.04,
      preOperative: 0.02,
    },
    workingCapitalCycle: {
      rawMaterialDays: 7,
      packagingDays: 7,
      finishedGoodsDays: 5,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 15,
    },
    defaultScheme: "MIDH Post-Harvest Infra & AIF 3% Subvention",
    subsidyRate: 0.35,
    subsidyCap: 3000000,
    promoterMarginRate: 0.20,
  },
  essentialOil: {
    key: "essentialOil",
    title: "Citrus Peel Essential Oil & Terpene Extraction",
    keywords: ["essential oil", "oil", "steam distillation", "peel oil", "cold press"],
    revenueMultiplier: 2.25,
    costRatios: {
      rawMaterial: 0.42,
      packaging: 0.08,
      electricity: 0.12,
      labour: 0.10,
      maintenance: 0.03,
      admin: 0.04,
    },
    capexSplit: {
      machinery: 0.70,
      civil: 0.16,
      electrification: 0.07,
      installation: 0.04,
      preOperative: 0.03,
    },
    workingCapitalCycle: {
      rawMaterialDays: 15,
      packagingDays: 15,
      finishedGoodsDays: 10,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "PMFME (MoFPI 35% Credit-Linked Capital Subsidy)",
    subsidyRate: 0.35,
    subsidyCap: 1000000,
    promoterMarginRate: 0.10,
  },
  bakeryCandiedPeel: {
    key: "bakeryCandiedPeel",
    title: "Artisanal Candied Peel, Marmalade & Bakery Inclusions",
    keywords: ["candy", "candied", "peel", "bakery", "marmalade", "jam"],
    revenueMultiplier: 2.30,
    costRatios: {
      rawMaterial: 0.38,
      packaging: 0.11,
      electricity: 0.08,
      labour: 0.14,
      maintenance: 0.02,
      admin: 0.03,
    },
    capexSplit: {
      machinery: 0.62,
      civil: 0.22,
      electrification: 0.08,
      installation: 0.05,
      preOperative: 0.03,
    },
    workingCapitalCycle: {
      rawMaterialDays: 20,
      packagingDays: 15,
      finishedGoodsDays: 10,
      receivableDays: 25,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "PMFME (MoFPI 35% Credit-Linked Capital Subsidy)",
    subsidyRate: 0.35,
    subsidyCap: 1000000,
    promoterMarginRate: 0.10,
  },
  organicFertilizer: {
    key: "organicFertilizer",
    title: "Citrus Pomace Organic Fertilizer & Vermicompost",
    keywords: ["fertilizer", "vermicompost", "manure", "organic", "pomace"],
    revenueMultiplier: 1.70,
    costRatios: {
      rawMaterial: 0.20,
      packaging: 0.09,
      electricity: 0.04,
      labour: 0.30,
      maintenance: 0.04,
      admin: 0.04,
    },
    capexSplit: {
      machinery: 0.42,
      civil: 0.42,
      electrification: 0.06,
      installation: 0.05,
      preOperative: 0.05,
    },
    workingCapitalCycle: {
      rawMaterialDays: 25,
      packagingDays: 10,
      finishedGoodsDays: 15,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "PMEGP MSME Margin Money Subsidy",
    subsidyRate: 0.25,
    subsidyCap: 1250000,
    promoterMarginRate: 0.10,
  },
  defaultAgri: {
    key: "defaultAgri",
    title: "Standard Citrus Agribusiness / Post-Harvest Hub",
    keywords: [],
    revenueMultiplier: 2.10,
    costRatios: {
      rawMaterial: 0.36,
      packaging: 0.10,
      electricity: 0.08,
      labour: 0.14,
      maintenance: 0.03,
      admin: 0.04,
    },
    capexSplit: {
      machinery: 0.64,
      civil: 0.22,
      electrification: 0.07,
      installation: 0.04,
      preOperative: 0.03,
    },
    workingCapitalCycle: {
      rawMaterialDays: 21,
      packagingDays: 15,
      finishedGoodsDays: 10,
      receivableDays: 30,
      payableDays: 15,
      cashBufferDays: 10,
    },
    defaultScheme: "PMFME (MoFPI 35% Credit-Linked Capital Subsidy)",
    subsidyRate: 0.35,
    subsidyCap: 1000000,
    promoterMarginRate: 0.10,
  },
};

/**
 * Resolves appropriate financial profile from opportunity name / category
 */
export function resolveFinancialProfile(opportunityName = "", category = "", customOverrides = null) {
  const combined = `${opportunityName} ${category}`.toLowerCase();
  let baseProfile = BUSINESS_FINANCIAL_PROFILES.defaultAgri;

  for (const [key, prof] of Object.entries(BUSINESS_FINANCIAL_PROFILES)) {
    if (key === "defaultAgri") continue;
    if (prof.keywords.some((kw) => combined.includes(kw))) {
      baseProfile = prof;
      break;
    }
  }

  if (customOverrides && typeof customOverrides === "object") {
    return {
      ...baseProfile,
      ...customOverrides,
      costRatios: {
        ...baseProfile.costRatios,
        ...(customOverrides.costRatios || {}),
      },
      capexSplit: {
        ...baseProfile.capexSplit,
        ...(customOverrides.capexSplit || {}),
      },
    };
  }

  return baseProfile;
}

/**
 * Calculate Monthly EMI using standard Banking Reducing Balance formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyEmi(principal, annualRate, tenureYears) {
  const p = Number(principal) || 0;
  const tenure = Number(tenureYears) || 5;
  const rate = Number(annualRate) || 8.5;

  if (p <= 0 || tenure <= 0) return 0;
  const r = rate / 1200; // Monthly interest rate
  const n = tenure * 12; // Total monthly instalments

  if (r === 0) return Math.round(p / n);
  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculate Net Present Value (NPV) at a given discount hurdle rate (default 10% for MSME/Agri):
 * NPV = -InitialOutlay + Sum_{t=1}^n [CF_t / (1 + discountRate)^t]
 */
export function calculateExactNPV(initialOutlay, cashFlows, discountRate = 0.10) {
  const c0 = Number(initialOutlay) || 0;
  const k = Number(discountRate) || 0.10;
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) return 0;

  const pvCashFlows = cashFlows.reduce((sum, cf, idx) => {
    return sum + Number(cf) / Math.pow(1 + k, idx + 1);
  }, 0);
  return Math.round(pvCashFlows - c0);
}

/**
 * Calculate Internal Rate of Return (IRR) numerically via Bisection:
 * The rate r where -InitialOutlay + Sum_{t=1}^n [CF_t / (1 + r)^t] = 0
 */
export function calculateExactIRR(initialOutlay, cashFlows) {
  const c0 = Number(initialOutlay) || 0;
  if (c0 <= 0 || !Array.isArray(cashFlows) || cashFlows.length === 0) return 0.0;

  const totalInflows = cashFlows.reduce((sum, cf) => sum + Number(cf), 0);
  if (totalInflows <= c0) return 0.0; // Negative or non-viable return

  let low = -0.50; // -50%
  let high = 2.50; // 250%
  const tolerance = 1e-4;

  for (let iter = 0; iter < 50; iter++) {
    const mid = (low + high) / 2;
    const npvMid = -c0 + cashFlows.reduce((sum, cf, idx) => sum + Number(cf) / Math.pow(1 + mid, idx + 1), 0);

    if (Math.abs(npvMid) < tolerance) {
      return parseFloat((mid * 100).toFixed(1));
    }

    const npvLow = -c0 + cashFlows.reduce((sum, cf, idx) => sum + Number(cf) / Math.pow(1 + low, idx + 1), 0);
    if (npvLow * npvMid < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return parseFloat((((low + high) / 2) * 100).toFixed(1));
}

/**
 * Comprehensive Bank Appraisal Credit Rating Scorecard (Out of 100 points)
 * Evaluates: DSCR (40 pts) + Break-Even Buffer (25 pts) + Promoter Margin (20 pts) + IRR (15 pts)
 */
export function calculateBankCreditGrade({ avgDSCR, bepPercentage, equityPercentage, irrPct, loan }) {
  if (loan === 0) {
    return {
      creditGrade: "Grade A++ (Zero Debt / 100% Self-Funded Equity)",
      creditBadgeColor: "var(--ok)",
      score: 100,
    };
  }

  let score = 0;

  // 1. DSCR (Debt Service Coverage Ratio) - 40 Points Max
  if (avgDSCR >= 2.0) score += 40;
  else if (avgDSCR >= 1.6) score += 34;
  else if (avgDSCR >= 1.4) score += 28;
  else if (avgDSCR >= 1.2) score += 20;
  else if (avgDSCR >= 1.0) score += 10;
  else score += 0;

  // 2. Break-Even Point Safety Buffer - 25 Points Max
  if (bepPercentage <= 35) score += 25;
  else if (bepPercentage <= 45) score += 20;
  else if (bepPercentage <= 55) score += 15;
  else if (bepPercentage <= 65) score += 10;
  else score += 4;

  // 3. Promoter Equity Margin - 20 Points Max
  if (equityPercentage >= 30) score += 20;
  else if (equityPercentage >= 20) score += 16;
  else if (equityPercentage >= 10) score += 12;
  else score += 4;

  // 4. IRR vs Bank Hurdle Rate (10%) - 15 Points Max
  if (irrPct >= 25) score += 15;
  else if (irrPct >= 18) score += 12;
  else if (irrPct >= 12) score += 8;
  else score += 3;

  if (score >= 85) {
    return { creditGrade: "Grade AAA (Prime Bankable - Exceptional Safety)", creditBadgeColor: "var(--ok)", score };
  } else if (score >= 75) {
    return { creditGrade: "Grade AA (Strong Bankable - Low Risk)", creditBadgeColor: "var(--ok)", score };
  } else if (score >= 65) {
    return { creditGrade: "Grade A+ (Bankable - Standard Institutional Risk)", creditBadgeColor: "var(--ok)", score };
  } else if (score >= 50) {
    return { creditGrade: "Grade B (Moderate Risk - Additional Collateral/Margin Required)", creditBadgeColor: "var(--amber)", score };
  } else {
    return { creditGrade: "Grade C (Sub-Standard - High Risk of Debt Servicing Stress)", creditBadgeColor: "#ef4444", score };
  }
}

/**
 * Calculates Working Capital Cycle & Operating Requirements based on Tandon/Nayak Committee Norms:
 * WC = Total Inventory (Raw Material + Packaging + Finished Goods) + Receivables + Cash Buffer - Supplier Payables
 */
export function calculateWorkingCapitalCycle({
  capex = 180000,
  profile,
  rawMaterialDays = null,
  packagingDays = null,
  finishedGoodsDays = null,
  receivableDays = null,
  payableDays = null,
  cashBufferDays = null,
}) {
  const defaults = profile?.workingCapitalCycle || {};
  const rmDays = rawMaterialDays !== null && rawMaterialDays !== undefined ? Number(rawMaterialDays) : (defaults.rawMaterialDays ?? 21);
  const pkgDays = packagingDays !== null && packagingDays !== undefined ? Number(packagingDays) : (defaults.packagingDays ?? 15);
  const fgDays = finishedGoodsDays !== null && finishedGoodsDays !== undefined ? Number(finishedGoodsDays) : (defaults.finishedGoodsDays ?? 10);
  const recDays = receivableDays !== null && receivableDays !== undefined ? Number(receivableDays) : (defaults.receivableDays ?? 30);
  const payDays = payableDays !== null && payableDays !== undefined ? Number(payableDays) : (defaults.payableDays ?? 15);
  const cashDays = cashBufferDays !== null && cashBufferDays !== undefined ? Number(cashBufferDays) : (defaults.cashBufferDays ?? 10);

  const revMultiplier = profile?.revenueMultiplier || 2.10;
  const annualRevenue = capex * revMultiplier;
  const costRatios = profile?.costRatios || {};

  const annualRM = annualRevenue * (costRatios.rawMaterial || 0.35);
  const annualPackaging = annualRevenue * (costRatios.packaging || 0.10);
  const totalOpExRatio = Object.values(costRatios).reduce((s, v) => s + v, 0);
  const annualOpEx = annualRevenue * totalOpExRatio;
  const monthlyOpEx = Math.round(annualOpEx / 12);

  // Daily operating expenses and sales from estimated annual/monthly expenses
  const dailyRevenue = Math.round(annualRevenue / 365);
  const dailyRM = Math.round(annualRM / 365);
  const dailyPackaging = Math.round(annualPackaging / 365);
  const dailyOpEx = Math.round(annualOpEx / 365);

  // Component calculations: Inventory, Receivables, Cash Buffer
  const rawMaterialInventory = Math.round(dailyRM * rmDays);
  const packagingInventory = Math.round(dailyPackaging * pkgDays);
  const finishedGoodsInventory = Math.round(dailyOpEx * fgDays);
  const totalInventory = rawMaterialInventory + packagingInventory + finishedGoodsInventory;

  const receivables = Math.round(dailyRevenue * recDays);
  const cashBuffer = Math.round(dailyOpEx * cashDays);
  const grossWorkingCapital = totalInventory + receivables + cashBuffer;

  // Supplier credit (payables on raw material and packaging procurement)
  const dailyProcurement = dailyRM + dailyPackaging;
  const payables = Math.round(dailyProcurement * payDays);

  // Net Working Capital = Inventory + Receivables + Cash - Payables
  const netWorkingCapital = Math.max(0, grossWorkingCapital - payables);

  // Operating cycle days: RM days + FG days + Receivable days - Supplier Credit days
  const operatingCycleDays = rmDays + fgDays + recDays - payDays;

  // Banking credit limit financing split (Nayak Committee: 75% Bank Cash Credit, 25% Promoter Margin)
  const bankCashCreditLimit = Math.round(netWorkingCapital * 0.75);
  const promoterMarginMoney = Math.round(netWorkingCapital * 0.25);

  return {
    operatingCycleDays,
    cycleDays: {
      rawMaterialDays: rmDays,
      packagingDays: pkgDays,
      finishedGoodsDays: fgDays,
      receivableDays: recDays,
      supplierCreditDays: payDays,
      cashBufferDays: cashDays,
    },
    dailyFigures: {
      dailyRevenue,
      dailyRM,
      dailyPackaging,
      dailyOpEx,
      monthlyOpEx,
    },
    components: {
      rawMaterialInventory,
      packagingInventory,
      finishedGoodsInventory,
      totalInventory,
      receivables,
      cashBuffer,
      grossWorkingCapital,
      payables,
      netWorkingCapital,
    },
    financing: {
      bankCashCreditLimit,
      promoterMarginMoney,
      bankSharePct: 75,
      promoterSharePct: 25,
    },
  };
}

// ============================================================================
// 2. MAIN BANKABLE DPR FINANCIAL CALCULATION ENGINE
// ============================================================================
export function calculateDPRProjections({
  totalCost = 180000,
  ownEquity = null,
  subsidyAmount = null,
  bankLoan = null,
  loanTenureYears = 5,
  loanInterestRate = 8.5,
  opportunityName = "Artisanal Candied Citrus Peel & Bakery Inclusions",
  category = "Food Processing & Value Addition",
  location = "Katol / Nagpur District",
  customProfile = null,
  rawMaterialDays = null,
  packagingDays = null,
  finishedGoodsDays = null,
  receivableDays = null,
  payableDays = null,
  cashBufferDays = null,
}) {
  const capex = Number(totalCost) || 180000;
  const tenure = Number(loanTenureYears) || 5;
  const interestRate = Number(loanInterestRate) || 8.5;

  // Step 2: Resolve Category-Specific Financial Profile
  const profile = resolveFinancialProfile(opportunityName, category, customProfile);
  const costRatios = profile.costRatios;
  const capexSplit = profile.capexSplit;

  // Step 3: Project Cost Breakdown
  const machineryPortion = Math.round(capex * capexSplit.machinery);
  const civilPortion = Math.round(capex * capexSplit.civil);
  const electrificationPortion = Math.round(capex * capexSplit.electrification);
  const installationPortion = Math.round(capex * capexSplit.installation);
  const preOperativePortion = Math.round(capex * capexSplit.preOperative);

  // Step 4: Working Capital Analysis via Operating Cycle & Inventory Inputs
  const workingCapitalAnalysis = calculateWorkingCapitalCycle({
    capex,
    profile,
    rawMaterialDays,
    packagingDays,
    finishedGoodsDays,
    receivableDays,
    payableDays,
    cashBufferDays,
  });

  const fixedAssetInvestment = capex;
  const initialWorkingCapital = workingCapitalAnalysis.components.netWorkingCapital;
  const totalProjectFunding = fixedAssetInvestment + initialWorkingCapital;
  const workingCapitalBuffer = initialWorkingCapital;

  const fullCapacityAnnualRevenue = Math.round(capex * profile.revenueMultiplier);

  // Step 4: Promoter Contribution
  const minPromoterMargin = Math.round(capex * profile.promoterMarginRate);
  let resolvedEquity = minPromoterMargin;
  if (ownEquity !== null && ownEquity !== undefined && Number(ownEquity) > 0) {
    resolvedEquity = Math.min(capex, Math.max(minPromoterMargin, Number(ownEquity)));
  }

  // Step 5: Initial Bank Financing Requirement (NO upfront subsidy deduction!)
  // Commercial banks sanction and disburse the balance after promoter equity:
  const initialBankLoan = Math.max(0, capex - resolvedEquity);

  // If caller explicitly passed a bankLoan override and it's positive, respect it
  const loan = bankLoan !== null && bankLoan !== undefined && Number(bankLoan) > 0
    ? Number(bankLoan)
    : initialBankLoan;

  // Step 6: Calculate Subsidy Separately (Back-Ended Credit-Linked)
  const calcSubsidy = Math.round(capex * profile.subsidyRate);
  const resolvedSubsidy = subsidyAmount !== null && subsidyAmount !== undefined && Number(subsidyAmount) > 0
    ? Number(subsidyAmount)
    : Math.min(calcSubsidy, profile.subsidyCap);

  const subsidyRecord = {
    estimatedAmount: resolvedSubsidy,
    ratePercentage: Math.round(profile.subsidyRate * 100),
    schemeName: profile.defaultScheme,
    subsidyCap: profile.subsidyCap,
    eligibilityStatus: "Eligible / Pre-Qualified",
    releaseMechanism: "Back-Ended Credit-Linked Capital Subsidy",
    releaseConditions: (
      "Disbursed by MoFPI/NABARD into borrower's Subsidy Reserve Fund (SRF) account post-inspection; " +
      "3-year lock-in period applies; adjusted against the term loan in final repayment tranches once project benchmarks are verified."
    ),
    adjustmentStatus: "Held in Subsidy Reserve Fund (No interest charged on subsidy portion once credited)",
    isDeductedFromInitialLoan: false,
  };

  // Step 7: Monthly EMI & 5-Year Amortization Schedule
  const monthlyEmi = calculateMonthlyEmi(loan, interestRate, tenure);
  const monthlyRate = interestRate / 1200;

  let currentMachineryWDV = machineryPortion;
  let currentCivilWDV = civilPortion;
  let currentLoanBalance = loan;

  const capacityRamp = [0.60, 0.72, 0.82, 0.90, 0.95];
  const yearlyProjections = [];

  for (let year = 1; year <= 5; year++) {
    const util = capacityRamp[year - 1];
    const revenue = Math.round(fullCapacityAnnualRevenue * util);

    // Dynamic cost breakdown based on profile
    const rawMaterials = Math.round(revenue * costRatios.rawMaterial);
    const packaging = Math.round(revenue * (costRatios.packaging || 0.08));
    const utilities = Math.round(revenue * costRatios.electricity);
    const laborAndWages = Math.round(revenue * costRatios.labour);
    const maintenance = Math.round(revenue * (costRatios.maintenance || 0.03));
    const adminAndSelling = Math.round(revenue * (costRatios.admin || 0.04));

    const totalOpEx = rawMaterials + packaging + utilities + laborAndWages + maintenance + adminAndSelling;
    const ebitda = revenue - totalOpEx;

    // Depreciation: WDV 15% machinery, 10% civil works
    const machDep = Math.round(currentMachineryWDV * 0.15);
    const civilDep = Math.round(currentCivilWDV * 0.10);
    const totalDepreciation = machDep + civilDep;
    currentMachineryWDV -= machDep;
    currentCivilWDV -= civilDep;

    // Annual Amortization (12 monthly cycles with reducing balance)
    let yearInterest = 0;
    let yearPrincipal = 0;

    for (let m = 0; m < 12; m++) {
      if (currentLoanBalance <= 0) break;
      const mInterest = Math.round(currentLoanBalance * monthlyRate);
      const mPrincipal = Math.min(currentLoanBalance, Math.max(0, monthlyEmi - mInterest));
      yearInterest += mInterest;
      yearPrincipal += mPrincipal;
      currentLoanBalance = Math.max(0, currentLoanBalance - mPrincipal);
    }

    const pbt = ebitda - totalDepreciation - yearInterest;
    const tax = pbt > 0 ? Math.round(pbt * 0.25) : 0; // MSME concessional rate 22% + Cess ~ 25%
    const pat = pbt - tax;

    const cashAccruals = pat + totalDepreciation;
    const debtService = yearPrincipal + yearInterest;

    let dscr = 0;
    if (debtService > 0) {
      dscr = parseFloat(((cashAccruals + yearInterest) / debtService).toFixed(2));
    } else {
      dscr = 9.99; // 100% Self-Funded / Zero Debt
    }

    yearlyProjections.push({
      year: `Year ${year}`,
      capacity: `${Math.round(util * 100)}%`,
      revenue,
      rawMaterials,
      packaging,
      utilities,
      laborAndWages,
      maintenance,
      adminAndSelling,
      totalOpEx,
      ebitda,
      depreciation: totalDepreciation,
      interest: yearInterest,
      principalPaid: yearPrincipal,
      pbt,
      tax,
      pat,
      cashAccruals,
      debtService,
      dscr,
      closingLoanBalance: currentLoanBalance,
    });
  }

  // Calculate Weighted Average DSCR
  const loanYears = yearlyProjections.filter((y) => y.debtService > 0);
  const avgDSCR =
    loanYears.length > 0
      ? parseFloat((loanYears.reduce((sum, y) => sum + y.dscr, 0) / loanYears.length).toFixed(2))
      : 9.99;

  // Break-Even Point (Year 1)
  const y1 = yearlyProjections[0];
  const fixedCosts = y1.depreciation + y1.interest + Math.round(y1.laborAndWages * 0.6) + y1.adminAndSelling;
  const variableCosts = y1.rawMaterials + y1.packaging + y1.utilities + Math.round(y1.laborAndWages * 0.4) + y1.maintenance;
  const contribution = y1.revenue - variableCosts;
  const bepPercentage = contribution > 0
    ? Math.min(85, Math.max(25, Math.round((fixedCosts / contribution) * 100)))
    : 42;

  // Exact Net Present Value (NPV @ 10% hurdle rate) & Internal Rate of Return (IRR)
  const cashFlows = yearlyProjections.map((y) => y.cashAccruals);
  const npv10 = calculateExactNPV(capex, cashFlows, 0.10);
  const irrPct = calculateExactIRR(capex, cashFlows);

  // Comprehensive Bank Appraisal Credit Rating Scorecard
  const equityPct = capex > 0 ? Math.round((resolvedEquity / capex) * 100) : 10;
  const ratingResult = calculateBankCreditGrade({
    avgDSCR,
    bepPercentage,
    equityPercentage: equityPct,
    irrPct,
    loan,
  });
  const creditGrade = ratingResult.creditGrade;
  const creditBadgeColor = ratingResult.creditBadgeColor;
  const creditScore = ratingResult.score;

  const wcPromoterMargin = workingCapitalAnalysis.financing.promoterMarginMoney;
  const wcBankLimit = workingCapitalAnalysis.financing.bankCashCreditLimit;
  const totalPromoterContribution = resolvedEquity + wcPromoterMargin;
  const totalBankFinancing = loan + wcBankLimit;

  return {
    totalCost: capex,
    fixedAssetInvestment,
    initialWorkingCapital,
    totalProjectFunding,
    fundingCategories: [
      {
        category: "Fixed asset investment",
        amount: fixedAssetInvestment,
        purpose: "Establishment: Plant, machinery, civil works, electrification, installation & pre-operative expenses",
      },
      {
        category: "Initial working capital",
        amount: initialWorkingCapital,
        purpose: "Operation: Operating cycle inventory (raw materials, packaging, finished goods), receivables & cash buffer minus payables",
      },
      {
        category: "Total project funding",
        amount: totalProjectFunding,
        purpose: "Combined project capital needed to establish and operate the commercial unit",
      },
    ],
    workingCapitalDetails: workingCapitalAnalysis,
    ownEquity: resolvedEquity,
    subsidyAmount: resolvedSubsidy,
    bankLoan: loan,
    initialBankLoan: loan,
    workingCapitalPromoterMargin: wcPromoterMargin,
    workingCapitalBankLimit: wcBankLimit,
    totalPromoterContribution,
    totalBankFinancing,
    subsidyPercentage: capex > 0 ? Math.round((resolvedSubsidy / capex) * 100) : 35,
    equityPercentage: capex > 0 ? Math.round((resolvedEquity / capex) * 100) : 10,
    loanPercentage: capex > 0 ? Math.round((loan / capex) * 100) : 90,
    loanInterestRate: interestRate,
    loanTenureYears: tenure,
    monthlyEmi,
    yearlyProjections,
    avgDSCR,
    bepPercentage,
    irrPct,
    npv10,
    creditGrade,
    creditBadgeColor,
    annualRevenueY1: y1.revenue,
    patY1: y1.pat,
    cashAccrualsY1: y1.cashAccruals,
    profileUsed: profile.title,
    costRatios,
    projectCostBreakdown: {
      machinery: machineryPortion,
      civil: civilPortion,
      electrification: electrificationPortion,
      installation: installationPortion,
      preOperative: preOperativePortion,
      workingCapitalBuffer: initialWorkingCapital,
    },
    subsidyRecord,
  };
}
