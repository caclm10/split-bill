export type CostType = "fixed" | "percentage"

export interface ExtraCost {
  type: CostType
  value: number
}

export interface Participant {
  id: string
  name: string
}

export interface Item {
  id: string
  name: string
  price: number
  qty: number
  sharedBy: string[] // Array of Participant IDs
}

export interface CustomCost {
  id: string
  name: string
  type: CostType
  mode: "surcharge" | "discount"
  value: number
}

export interface PaymentInfo {
  bank: string
  accountNumber: string
  name: string
}

export interface BillState {
  billName: string
  date: string
  paymentInfo: PaymentInfo
  participants: Participant[]
  items: Item[]
  customCosts: CustomCost[]
}
