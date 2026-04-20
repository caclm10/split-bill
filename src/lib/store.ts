import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string"
import type { BillState } from "./types"

export const defaultState: BillState = {
  billName: "",
  date: new Date().toISOString().split("T")[0],
  paymentInfo: { bank: "", accountNumber: "", name: "" },
  participants: [],
  items: [],
  customCosts: [],
}

function minifyState(state: BillState): any {
  // Map participant UUIDs to their index to save massive URL space
  const pMap = new Map<string, number>()
  state.participants.forEach((p, index) => {
    pMap.set(p.id, index)
  })

  return {
    n: state.billName,
    d: state.date,
    p: [state.paymentInfo.bank, state.paymentInfo.accountNumber, state.paymentInfo.name],
    u: state.participants.map((p) => p.name), // Array of names, index acts as ID
    i: state.items.map((item) => ({
      n: item.name,
      p: item.price,
      q: item.qty,
      s: item.sharedBy.map((id) => pMap.get(id)).filter((val) => val !== undefined),
    })),
    c: state.customCosts.map((cost) => ({
      n: cost.name,
      t: cost.type === "percentage" ? 1 : 0,
      m: cost.mode === "discount" ? 1 : 0,
      v: cost.value,
    })),
  }
}

function unminifyState(minified: any): BillState {
  // Restore UUIDs for participants based on their array index
  const participants = (minified.u || []).map((name: string) => ({
    id: crypto.randomUUID(),
    name,
  }))

  return {
    billName: minified.n || "",
    date: minified.d || new Date().toISOString().split("T")[0],
    paymentInfo: {
      bank: minified.p?.[0] || "",
      accountNumber: minified.p?.[1] || "",
      name: minified.p?.[2] || "",
    },
    participants,
    items: (minified.i || []).map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.n || "",
      price: item.p || 0,
      qty: item.q || 1,
      sharedBy: (item.s || [])
        .map((idx: number) => participants[idx]?.id)
        .filter(Boolean),
    })),
    customCosts: (minified.c || []).map((cost: any) => ({
      id: crypto.randomUUID(),
      name: cost.n || "",
      type: cost.t === 1 ? "percentage" : "fixed",
      mode: cost.m === 1 ? "discount" : "surcharge",
      value: cost.v || 0,
    })),
  }
}

export function encodeBillState(state: BillState): string {
  const minified = minifyState(state)
  const jsonString = JSON.stringify(minified)
  return compressToEncodedURIComponent(jsonString)
}

export function decodeBillState(encoded: string): BillState | null {
  try {
    const jsonString = decompressFromEncodedURIComponent(encoded)
    if (!jsonString) return null
    const minified = JSON.parse(jsonString)
    return unminifyState(minified)
  } catch (error) {
    console.error("Failed to decode bill state from URL", error)
    return null
  }
}
