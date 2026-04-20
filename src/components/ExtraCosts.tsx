import type { BillState, CustomCost } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { parseNumberInput, formatNumberInput } from "@/lib/format"

interface ExtraCostsProps {
  state: BillState
  updateState: (newState: BillState) => void
}

export function ExtraCosts({ state, updateState }: ExtraCostsProps) {
  const addCost = () => {
    const newCost: CustomCost = {
      id: crypto.randomUUID(),
      name: "",
      type: "fixed",
      mode: "surcharge",
      value: 0,
    }
    updateState({ ...state, customCosts: [...state.customCosts, newCost] })
  }

  const removeCost = (id: string) => {
    updateState({ ...state, customCosts: state.customCosts.filter((c) => c.id !== id) })
  }

  const updateCost = (id: string, updates: Partial<CustomCost>) => {
    const newCosts = state.customCosts.map((c) => (c.id === id ? { ...c, ...updates } : c))
    updateState({ ...state, customCosts: newCosts })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3. Biaya Tambahan</span>
          <Button variant="default" size="sm" onClick={addCost} className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Biaya
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {state.customCosts.map((cost) => (
            <div key={cost.id} className="p-4 border rounded-lg bg-card/50 space-y-4 shadow-sm animate-in zoom-in-95 fade-in">
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Nama Biaya</Label>
                  <Input
                    placeholder="Contoh: Ongkir, Pajak, Diskon..."
                    value={cost.name}
                    onChange={(e) => updateCost(cost.id, { name: e.target.value })}
                  />
                </div>

                <div className="w-1/4 min-w-[100px] space-y-1 shrink-0">
                  <Label className="text-xs text-muted-foreground">Jenis</Label>
                  <div className="flex rounded-md border border-input shadow-sm">
                    <Button
                      variant={cost.mode === "surcharge" ? "destructive" : "ghost"}
                      size="sm"
                      className={`flex-1 rounded-r-none px-2 font-medium h-9 text-xs border-r ${cost.mode === "surcharge" ? "" : "text-muted-foreground"}`}
                      onClick={() => updateCost(cost.id, { mode: "surcharge" })}
                    >
                      Biaya
                    </Button>
                    <Button
                      variant={cost.mode === "discount" ? "default" : "ghost"}
                      size="sm"
                      className={`flex-1 rounded-none px-2 font-medium h-9 text-xs border-r ${cost.mode === "discount" ? "" : "text-muted-foreground"}`}
                      onClick={() => updateCost(cost.id, { mode: "discount" })}
                    >
                      Diskon
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Tipe & Jumlah</Label>
                  <div className="flex rounded-md border border-input shadow-sm">
                    <Button
                      variant={cost.type === "fixed" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-r-none px-3 font-medium h-9 text-xs border-r"
                      onClick={() => updateCost(cost.id, { type: "fixed" })}
                    >
                      Rp
                    </Button>
                    <Button
                      variant={cost.type === "percentage" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-none px-3 font-medium h-9 text-xs border-r"
                      onClick={() => updateCost(cost.id, { type: "percentage" })}
                    >
                      %
                    </Button>
                    <Input
                      type={cost.type === "percentage" ? "number" : "text"}
                      inputMode="numeric"
                      min="0"
                      className="h-9 border-0 focus-visible:ring-0 rounded-l-none"
                      placeholder="0"
                      value={cost.type === "percentage" ? (cost.value || "") : formatNumberInput(cost.value)}
                      onChange={(e) => updateCost(cost.id, { 
                        value: cost.type === "percentage" ? (parseFloat(e.target.value) || 0) : parseNumberInput(e.target.value) 
                      })}
                    />
                  </div>
                </div>

                <div className="pt-5 flex self-end sm:self-auto shrink-0">
                  <Button variant="ghost" size="icon" className="text-destructive sm:ml-2" onClick={() => removeCost(cost.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </div>
          ))}

          {state.customCosts.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-6 border rounded-md border-dashed">
              Belum ada biaya tambahan.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
