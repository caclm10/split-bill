import type { BillState, CostType } from "./types"

export interface PersonItemBreakdown {
  name: string
  splitPrice: number
}

export interface PersonTotal {
  id: string
  name: string
  subtotal: number
  customCostShare: number
  surchargesShare: number
  discountsShare: number
  itemsBreakdown: PersonItemBreakdown[]
  total: number
}

export interface CalculatedCost {
  name: string
  amount: number
}

export interface BillCalculationResult {
  personTotals: PersonTotal[]
  totalItemsSubtotal: number
  calculatedCustomCosts: CalculatedCost[]
  totalCustomCosts: number
  grandTotal: number
}

function calculateExtraCostValue(baseAmount: number, type: CostType, value: number): number {
  if (type === "fixed") {
    return value
  }
  return baseAmount * (value / 100)
}

export function calculateBill(state: BillState): BillCalculationResult {
  // 1. Calculate subtotal for each person
  const personSubtotals = new Map<string, number>()
  const personItemsBreakdowns = new Map<string, PersonItemBreakdown[]>()

  state.participants.forEach((p) => {
    personSubtotals.set(p.id, 0)
    personItemsBreakdowns.set(p.id, [])
  })

  let totalItemsSubtotal = 0

  state.items.forEach((item) => {
    if (item.sharedBy.length === 0) return

    const itemTotal = item.price * (item.qty || 1)
    const pricePerPerson = itemTotal / item.sharedBy.length
    
    item.sharedBy.forEach((personId) => {
      // Subtotal accumulation
      const current = personSubtotals.get(personId) || 0
      personSubtotals.set(personId, current + pricePerPerson)
      
      // Breakdown accumulation
      const breakdowns = personItemsBreakdowns.get(personId) || []
      breakdowns.push({ name: item.name || "Item Tanpa Nama", splitPrice: pricePerPerson })
      personItemsBreakdowns.set(personId, breakdowns)
    })
    totalItemsSubtotal += itemTotal
  })

  // 2. Calculate Total Custom Costs sum
  let totalCustomCosts = 0
  let totalSurcharges = 0
  let totalDiscounts = 0
  const calculatedCustomCosts: CalculatedCost[] = []

  state.customCosts.forEach((cost) => {
    let amount = calculateExtraCostValue(totalItemsSubtotal, cost.type, cost.value)
    if (amount === 0) return

    if (cost.mode === "discount") {
      calculatedCustomCosts.push({ name: cost.name || "Diskon", amount: -amount })
      totalCustomCosts -= amount
      totalDiscounts += amount
    } else {
      calculatedCustomCosts.push({ name: cost.name || "Biaya Tambahan", amount })
      totalCustomCosts += amount
      totalSurcharges += amount
    }
  })

  // 3. Distribute extra costs proportionally
  const personTotals: PersonTotal[] = state.participants.map((p) => {
    const subtotal = personSubtotals.get(p.id) || 0
    let customCostShare = 0
    let surchargesShare = 0
    let discountsShare = 0

    if (totalItemsSubtotal > 0) {
      const proportion = subtotal / totalItemsSubtotal
      customCostShare = proportion * totalCustomCosts
      surchargesShare = proportion * totalSurcharges
      discountsShare = proportion * totalDiscounts
    }

    return {
      id: p.id,
      name: p.name,
      subtotal,
      customCostShare,
      surchargesShare,
      discountsShare,
      itemsBreakdown: personItemsBreakdowns.get(p.id) || [],
      total: subtotal + customCostShare,
    }
  })

  return {
    personTotals,
    totalItemsSubtotal,
    calculatedCustomCosts,
    totalCustomCosts,
    grandTotal: totalItemsSubtotal + totalCustomCosts,
  }
}
