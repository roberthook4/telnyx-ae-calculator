/**
 * Telnyx AE Commission Calculator
 * 2025 Commission Plan Implementation
 */

// Commission rates by product category
const COMMISSION_RATES = {
    sms: {
        year1: {
            baseContracted: 0.085,
            baseNonContracted: 0.06,
            variableContracted: 0.035,
            variableNonContracted: 0.025
        },
        year2: {
            baseContracted: 0.05,
            baseNonContracted: 0.05,
            variableContracted: 0.0125,
            variableNonContracted: 0.0125
        }
    },
    voice: {
        year1: {
            baseContracted: 0.30,
            baseNonContracted: 0.20,
            variableContracted: 0.07,
            variableNonContracted: 0.05
        },
        year2: {
            baseContracted: 0.15,
            baseNonContracted: 0.15,
            variableContracted: 0.025,
            variableNonContracted: 0.025
        }
    },
    support: {
        year1: {
            baseContracted: 0.17,
            baseNonContracted: 0.12,
            variableContracted: 0.07,
            variableNonContracted: 0.05
        },
        year2: {
            baseContracted: 0.10,
            baseNonContracted: 0.10,
            variableContracted: 0.025,
            variableNonContracted: 0.025
        }
    }
};

// Seasoning adjustments (ramp multipliers)
const SEASONING = [
    { months: [1, 2], multiplier: 3.0, cap: 10000 },
    { months: [3, 4, 5], multiplier: 2.5, cap: 10000 },
    { months: [6, 7, 8, 9], multiplier: 2.0, cap: 10000 },
    // Month 10+ has no adjustment (multiplier = 1)
];

// Quota accelerator rate
const ACCELERATOR_RATE = 0.10;
const MAX_ATTAINMENT = 2.0; // 200% cap

// DOM Elements
const elements = {
    baseSalary: document.getElementById('baseSalary'),
    rampPeriod: document.getElementById('rampPeriod'),
    monthlyGP: document.getElementById('monthlyGP'),
    monthlyGPSlider: document.getElementById('monthlyGPSlider'),
    quota: document.getElementById('quota'),
    smsSlider: document.getElementById('smsSlider'),
    voiceSlider: document.getElementById('voiceSlider'),
    supportSlider: document.getElementById('supportSlider'),
    contractedSlider: document.getElementById('contractedSlider'),
    
    // Display elements
    smsPercent: document.getElementById('smsPercent'),
    voicePercent: document.getElementById('voicePercent'),
    supportPercent: document.getElementById('supportPercent'),
    contractedPercent: document.getElementById('contractedPercent'),
    contractedValue: document.getElementById('contractedValue'),
    nonContractedValue: document.getElementById('nonContractedValue'),
    mixTotalValue: document.getElementById('mixTotalValue'),
    mixTotal: document.getElementById('mixTotal'),
    quotaAttainment: document.getElementById('quotaAttainment'),
    
    // Output elements
    year1TotalComp: document.getElementById('year1TotalComp'),
    year1FullProd: document.getElementById('year1FullProd'),
    year2Residual: document.getElementById('year2Residual'),
    monthlyCommission: document.getElementById('monthlyCommission'),
    scenarioTableBody: document.getElementById('scenarioTableBody'),
    
    // Deal calculator elements
    dealMRR: document.getElementById('dealMRR'),
    dealProduct: document.getElementById('dealProduct'),
    dealContracted: document.getElementById('dealContracted'),
    dealType: document.getElementById('dealType'),
    dealYear1: document.getElementById('dealYear1'),
    dealYear2: document.getElementById('dealYear2'),
    dealTotal: document.getElementById('dealTotal'),
    dealYear1Detail: document.getElementById('dealYear1Detail'),
    dealYear2Detail: document.getElementById('dealYear2Detail'),
    dealTotalDetail: document.getElementById('dealTotalDetail')
};

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Calculate commission for a given GP amount and product/contract mix
 */
function calculateMonthlyCommission(monthlyGP, productMix, contractedPct, quota, year = 1) {
    const rates = year === 1 ? 'year1' : 'year2';
    const contracted = contractedPct / 100;
    const nonContracted = 1 - contracted;
    
    // Calculate GP by product category
    const smsGP = monthlyGP * (productMix.sms / 100);
    const voiceGP = monthlyGP * (productMix.voice / 100);
    const supportGP = monthlyGP * (productMix.support / 100);
    
    // Calculate base commission for each category
    let baseCommission = 0;
    
    // SMS
    baseCommission += smsGP * contracted * COMMISSION_RATES.sms[rates].baseContracted;
    baseCommission += smsGP * nonContracted * COMMISSION_RATES.sms[rates].baseNonContracted;
    
    // Voice
    baseCommission += voiceGP * contracted * COMMISSION_RATES.voice[rates].baseContracted;
    baseCommission += voiceGP * nonContracted * COMMISSION_RATES.voice[rates].baseNonContracted;
    
    // Support
    baseCommission += supportGP * contracted * COMMISSION_RATES.support[rates].baseContracted;
    baseCommission += supportGP * nonContracted * COMMISSION_RATES.support[rates].baseNonContracted;
    
    // Calculate variable commission (above quota)
    let variableCommission = 0;
    if (monthlyGP > quota) {
        const gpAboveQuota = Math.min(monthlyGP - quota, quota * (MAX_ATTAINMENT - 1));
        
        // Variable commission by category
        const smsAbove = gpAboveQuota * (productMix.sms / 100);
        const voiceAbove = gpAboveQuota * (productMix.voice / 100);
        const supportAbove = gpAboveQuota * (productMix.support / 100);
        
        // SMS variable
        variableCommission += smsAbove * contracted * COMMISSION_RATES.sms[rates].variableContracted;
        variableCommission += smsAbove * nonContracted * COMMISSION_RATES.sms[rates].variableNonContracted;
        
        // Voice variable
        variableCommission += voiceAbove * contracted * COMMISSION_RATES.voice[rates].variableContracted;
        variableCommission += voiceAbove * nonContracted * COMMISSION_RATES.voice[rates].variableNonContracted;
        
        // Support variable
        variableCommission += supportAbove * contracted * COMMISSION_RATES.support[rates].variableContracted;
        variableCommission += supportAbove * nonContracted * COMMISSION_RATES.support[rates].variableNonContracted;
        
        // Add accelerator bonus (10% extra on GP above quota)
        variableCommission += gpAboveQuota * ACCELERATOR_RATE;
    }
    
    return baseCommission + variableCommission;
}

/**
 * Apply seasoning adjustment to commission
 */
function applySeasoningAdjustment(baseCommission, month) {
    for (const period of SEASONING) {
        if (period.months.includes(month)) {
            const adjustedCommission = baseCommission * period.multiplier;
            const uplift = adjustedCommission - baseCommission;
            const cappedUplift = Math.min(uplift, period.cap);
            return baseCommission + cappedUplift;
        }
    }
    return baseCommission; // No adjustment for month 10+
}

/**
 * Calculate full year compensation
 */
function calculateYear1WithRamp(baseSalary, monthlyGP, productMix, contractedPct, quota, rampMonths) {
    let totalCommission = 0;
    
    for (let month = 1; month <= 12; month++) {
        const baseCommission = calculateMonthlyCommission(monthlyGP, productMix, contractedPct, quota, 1);
        
        // Apply seasoning for months within ramp period
        if (month <= rampMonths) {
            totalCommission += applySeasoningAdjustment(baseCommission, month);
        } else {
            totalCommission += baseCommission;
        }
    }
    
    return baseSalary + totalCommission;
}

/**
 * Calculate Year 1 at full productivity (no ramp adjustment)
 */
function calculateYear1FullProductivity(baseSalary, monthlyGP, productMix, contractedPct, quota) {
    const monthlyCommission = calculateMonthlyCommission(monthlyGP, productMix, contractedPct, quota, 1);
    return baseSalary + (monthlyCommission * 12);
}

/**
 * Calculate Year 2 residual from Year 1 deals
 */
function calculateYear2Residual(monthlyGP, productMix, contractedPct, quota) {
    // Year 2 residual is paid on the GP that continues from year 1 deals
    // Assuming the same GP continues to flow
    const monthlyResidual = calculateMonthlyCommission(monthlyGP, productMix, contractedPct, quota, 2);
    return monthlyResidual * 12;
}

/**
 * Get current input values
 */
function getInputValues() {
    return {
        baseSalary: parseFloat(elements.baseSalary.value) || 70000,
        rampPeriod: parseInt(elements.rampPeriod.value) || 6,
        monthlyGP: parseFloat(elements.monthlyGP.value) || 0,
        quota: parseFloat(elements.quota.value) || 5000,
        productMix: {
            sms: parseFloat(elements.smsSlider.value) || 0,
            voice: parseFloat(elements.voiceSlider.value) || 0,
            support: parseFloat(elements.supportSlider.value) || 0
        },
        contractedPct: parseFloat(elements.contractedSlider.value) || 70
    };
}

/**
 * Update all displays
 */
function updateDisplay() {
    const values = getInputValues();
    
    // Update product mix percentages
    elements.smsPercent.textContent = `${values.productMix.sms}%`;
    elements.voicePercent.textContent = `${values.productMix.voice}%`;
    elements.supportPercent.textContent = `${values.productMix.support}%`;
    
    // Update mix total
    const mixTotal = values.productMix.sms + values.productMix.voice + values.productMix.support;
    elements.mixTotalValue.textContent = `${mixTotal}%`;
    
    if (mixTotal !== 100) {
        elements.mixTotal.classList.add('error');
    } else {
        elements.mixTotal.classList.remove('error');
    }
    
    // Update contracted split
    elements.contractedPercent.textContent = `${values.contractedPct}%`;
    elements.contractedValue.textContent = `${values.contractedPct}%`;
    elements.nonContractedValue.textContent = `${100 - values.contractedPct}%`;
    
    // Update quota attainment
    const attainment = values.quota > 0 ? (values.monthlyGP / values.quota * 100) : 0;
    elements.quotaAttainment.textContent = `${Math.round(attainment)}%`;
    
    // Calculate main values
    const year1Total = calculateYear1WithRamp(
        values.baseSalary,
        values.monthlyGP,
        values.productMix,
        values.contractedPct,
        values.quota,
        values.rampPeriod
    );
    
    const year1FullProd = calculateYear1FullProductivity(
        values.baseSalary,
        values.monthlyGP,
        values.productMix,
        values.contractedPct,
        values.quota
    );
    
    const year2Residual = calculateYear2Residual(
        values.monthlyGP,
        values.productMix,
        values.contractedPct,
        values.quota
    );
    
    const monthlyCommission = calculateMonthlyCommission(
        values.monthlyGP,
        values.productMix,
        values.contractedPct,
        values.quota,
        1
    );
    
    // Update summary cards
    elements.year1TotalComp.textContent = formatCurrency(year1Total);
    elements.year1FullProd.textContent = formatCurrency(year1FullProd);
    elements.year2Residual.textContent = formatCurrency(year2Residual);
    elements.monthlyCommission.textContent = formatCurrency(monthlyCommission);
    
    // Update scenario table
    updateScenarioTable(values);
}

/**
 * Update scenario table
 */
function updateScenarioTable(values) {
    const scenarios = [0.8, 1.0, 1.2, 1.5];
    const currentAttainment = values.quota > 0 ? values.monthlyGP / values.quota : 0;
    
    let html = '';
    
    for (const attainment of scenarios) {
        const scenarioGP = values.quota * attainment;
        
        const monthlyCommission = calculateMonthlyCommission(
            scenarioGP,
            values.productMix,
            values.contractedPct,
            values.quota,
            1
        );
        
        const year1Total = calculateYear1WithRamp(
            values.baseSalary,
            scenarioGP,
            values.productMix,
            values.contractedPct,
            values.quota,
            values.rampPeriod
        );
        
        const year2Residual = calculateYear2Residual(
            scenarioGP,
            values.productMix,
            values.contractedPct,
            values.quota
        );
        
        // Check if this is close to current attainment
        const isCurrent = Math.abs(attainment - currentAttainment) < 0.1;
        
        html += `
            <tr class="${isCurrent ? 'current' : ''}">
                <td>${Math.round(attainment * 100)}%</td>
                <td>${formatCurrency(scenarioGP)}</td>
                <td>${formatCurrency(monthlyCommission)}</td>
                <td>${formatCurrency(year1Total)}</td>
                <td>${formatCurrency(year2Residual)}</td>
            </tr>
        `;
    }
    
    elements.scenarioTableBody.innerHTML = html;
}

/**
 * Sync GP slider and input
 */
function syncGPInputs(source) {
    if (source === 'slider') {
        elements.monthlyGP.value = elements.monthlyGPSlider.value;
    } else {
        elements.monthlyGPSlider.value = elements.monthlyGP.value;
    }
}

/**
 * Balance product mix sliders
 * When one slider changes, adjust others proportionally to maintain 100%
 */
function balanceProductMix(changedSlider) {
    const sliders = {
        sms: elements.smsSlider,
        voice: elements.voiceSlider,
        support: elements.supportSlider
    };
    
    const values = {
        sms: parseFloat(sliders.sms.value),
        voice: parseFloat(sliders.voice.value),
        support: parseFloat(sliders.support.value)
    };
    
    const total = values.sms + values.voice + values.support;
    
    // If total is 100, we're good
    if (total === 100) return;
    
    // Calculate how much we need to adjust
    const diff = total - 100;
    
    // Get the other sliders (not the one that changed)
    const otherKeys = Object.keys(values).filter(k => sliders[k] !== changedSlider);
    const otherTotal = otherKeys.reduce((sum, k) => sum + values[k], 0);
    
    // If other sliders have no value, can't balance
    if (otherTotal === 0) {
        // Just cap the changed slider
        changedSlider.value = 100;
        return;
    }
    
    // Distribute the diff proportionally among other sliders
    for (const key of otherKeys) {
        const proportion = values[key] / otherTotal;
        const adjustment = diff * proportion;
        const newValue = Math.max(0, Math.min(100, values[key] - adjustment));
        sliders[key].value = Math.round(newValue);
    }
    
    // Fine-tune to exactly 100
    const newTotal = parseFloat(sliders.sms.value) + 
                     parseFloat(sliders.voice.value) + 
                     parseFloat(sliders.support.value);
    
    if (newTotal !== 100 && otherKeys.length > 0) {
        const firstOther = otherKeys[0];
        sliders[firstOther].value = parseFloat(sliders[firstOther].value) + (100 - newTotal);
    }
}

/**
 * Calculate commission for a single deal
 */
function calculateDealCommission(mrr, productType, isContracted, isNewBusiness) {
    const rates = COMMISSION_RATES[productType];
    const year1Rate = isContracted ? rates.year1.baseContracted : rates.year1.baseNonContracted;
    const year2Rate = isContracted ? rates.year2.baseContracted : rates.year2.baseNonContracted;
    
    const monthlyYear1 = mrr * year1Rate;
    const monthlyYear2 = mrr * year2Rate;
    
    const year1Total = monthlyYear1 * 12;
    const year2Total = isNewBusiness ? (monthlyYear2 * 12) : 0; // Upsells only get 12 months
    
    return {
        monthlyYear1,
        monthlyYear2,
        year1Total,
        year2Total,
        total: year1Total + year2Total,
        months: isNewBusiness ? 24 : 12
    };
}

/**
 * Update deal calculator display
 */
function updateDealCalculator() {
    const mrr = parseFloat(elements.dealMRR.value) || 0;
    const productType = elements.dealProduct.value;
    const isContracted = elements.dealContracted.value === 'contracted';
    const isNewBusiness = elements.dealType.value === 'new';
    
    const deal = calculateDealCommission(mrr, productType, isContracted, isNewBusiness);
    
    elements.dealYear1.textContent = formatCurrency(deal.year1Total);
    elements.dealYear1Detail.textContent = `${formatCurrency(deal.monthlyYear1)}/mo × 12 months`;
    
    if (isNewBusiness) {
        elements.dealYear2.textContent = formatCurrency(deal.year2Total);
        elements.dealYear2Detail.textContent = `${formatCurrency(deal.monthlyYear2)}/mo × 12 months`;
    } else {
        elements.dealYear2.textContent = '$0';
        elements.dealYear2Detail.textContent = 'Upsells: 12-month payout only';
    }
    
    elements.dealTotal.textContent = formatCurrency(deal.total);
    elements.dealTotalDetail.textContent = `Over ${deal.months} months`;
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Basic inputs
    elements.baseSalary.addEventListener('input', updateDisplay);
    elements.rampPeriod.addEventListener('change', updateDisplay);
    elements.quota.addEventListener('input', updateDisplay);
    
    // GP slider and input sync
    elements.monthlyGPSlider.addEventListener('input', () => {
        syncGPInputs('slider');
        updateDisplay();
    });
    
    elements.monthlyGP.addEventListener('input', () => {
        syncGPInputs('input');
        updateDisplay();
    });
    
    // Product mix sliders with auto-balance
    elements.smsSlider.addEventListener('input', () => {
        balanceProductMix(elements.smsSlider);
        updateDisplay();
    });
    
    elements.voiceSlider.addEventListener('input', () => {
        balanceProductMix(elements.voiceSlider);
        updateDisplay();
    });
    
    elements.supportSlider.addEventListener('input', () => {
        balanceProductMix(elements.supportSlider);
        updateDisplay();
    });
    
    // Contract split slider
    elements.contractedSlider.addEventListener('input', updateDisplay);
    
    // Deal calculator inputs
    elements.dealMRR.addEventListener('input', updateDealCalculator);
    elements.dealProduct.addEventListener('change', updateDealCalculator);
    elements.dealContracted.addEventListener('change', updateDealCalculator);
    elements.dealType.addEventListener('change', updateDealCalculator);
}

/**
 * Initialize the calculator
 */
function init() {
    initEventListeners();
    updateDisplay();
    updateDealCalculator();
}

// Start the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', init);
