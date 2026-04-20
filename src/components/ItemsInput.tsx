import type { BillState, Item } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { parseNumberInput, formatNumberInput } from "@/lib/format"

interface ItemsInputProps {
  state: BillState
  updateState: (newState: BillState) => void
}

export function ItemsInput({ state, updateState }: ItemsInputProps) {
  const addItem = () => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name: "",
      price: 0,
      qty: 1,
      sharedBy: [],
    }
    updateState({ ...state, items: [...state.items, newItem] })
  }

  const removeItem = (id: string) => {
    updateState({ ...state, items: state.items.filter((item) => item.id !== id) })
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    const newItems = state.items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    updateState({ ...state, items: newItems })
  }

  const toggleParticipantShare = (itemId: string, participantId: string, checked: boolean) => {
    const item = state.items.find((i) => i.id === itemId)
    if (!item) return

    let newSharedBy = [...item.sharedBy]
    if (checked) {
      if (!newSharedBy.includes(participantId)) newSharedBy.push(participantId)
    } else {
      newSharedBy = newSharedBy.filter((id) => id !== participantId)
    }

    updateItem(itemId, { sharedBy: newSharedBy })
  }

  const shareEqually = (itemId: string) => {
    const allParticipantIds = state.participants.map((p) => p.id)
    updateItem(itemId, { sharedBy: allParticipantIds })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>2. Daftar Pesanan</span>
          <Button variant="default" size="sm" onClick={addItem} className="h-8">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Barang
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {state.items.map((item, i) => (
            <div key={item.id} className="p-4 border rounded-lg bg-card/50 space-y-4 shadow-sm animate-in zoom-in-95 fade-in">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Nama Barang</Label>
                  <Input
                    placeholder={`Item ${i + 1}`}
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  />
                </div>
                <div className="w-20 space-y-1 shrink-0">
                  <Label className="text-xs text-muted-foreground">Jml</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={item.qty || ""}
                    onChange={(e) => updateItem(item.id, { qty: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex-1 space-y-1 w-full">
                  <Label className="text-xs text-muted-foreground">Harga @ (Rp)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberInput(item.price)}
                    onChange={(e) => updateItem(item.id, { price: parseNumberInput(e.target.value) })}
                  />
                </div>
                <div className="pt-5 flex self-end sm:self-auto shrink-0">
                  <Button variant="ghost" size="icon" className="text-destructive sm:ml-2" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {state.participants.length > 0 && (
                <div className="pt-2 border-t mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dibayar oleh</Label>
                    <Button variant="secondary" size="sm" className="h-7 text-xs px-2" onClick={() => shareEqually(item.id)}>
                      <Users className="h-3 w-3 mr-1.5" />
                      Bagi Rata ({state.participants.length})
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-3">
                    {state.participants.map((p) => {
                      const isChecked = item.sharedBy.includes(p.id)
                      return (
                        <div key={p.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.id}-${p.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => toggleParticipantShare(item.id, p.id, checked as boolean)}
                          />
                          <label
                            htmlFor={`${item.id}-${p.id}`}
                            className="text-sm font-medium leading-none cursor-pointer select-none"
                          >
                            {p.name || "Tanpa Nama"}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
          {state.items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-6 border rounded-md border-dashed">
              Belum ada pesanan. Tambahkan barang pertama.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
