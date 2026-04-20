import type { BillState, Participant } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BillSetupProps {
  state: BillState
  updateState: (newState: BillState) => void
}

export function BillSetup({ state, updateState }: BillSetupProps) {
  const addParticipant = () => {
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: "",
    }
    updateState({ ...state, participants: [...state.participants, newParticipant] })
  }

  const removeParticipant = (id: string) => {
    // Remove participant
    const newParticipants = state.participants.filter((p) => p.id !== id)
    // Also remove them from any shared items
    const newItems = state.items.map((item) => ({
      ...item,
      sharedBy: item.sharedBy.filter((pid) => pid !== id),
    }))

    updateState({ ...state, participants: newParticipants, items: newItems })
  }

  const updateParticipantName = (id: string, name: string) => {
    const newParticipants = state.participants.map((p) => (p.id === id ? { ...p, name } : p))
    updateState({ ...state, participants: newParticipants })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>1. Informasi Tagihan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billName">Nama Tagihan</Label>
              <Input
                id="billName"
                placeholder="Contoh: Makan Siang di Senayan"
                value={state.billName}
                onChange={(e) => updateState({ ...state, billName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={state.date}
                onChange={(e) => updateState({ ...state, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-3 p-4 border rounded-lg bg-card/50">
            <Label className="font-semibold text-base">Info Pembayaran (Opsional)</Label>
            
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="bank" className="text-xs text-muted-foreground">Bank / E-Wallet</Label>
                <Input
                  id="bank"
                  placeholder="Contoh: BCA, GoPay, Dana"
                  value={state.paymentInfo.bank}
                  onChange={(e) => updateState({ 
                    ...state, 
                    paymentInfo: { ...state.paymentInfo, bank: e.target.value } 
                  })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="accountNumber" className="text-xs text-muted-foreground">Nomor Pembayaran</Label>
                <Input
                  id="accountNumber"
                  placeholder="Contoh: 1234567890"
                  value={state.paymentInfo.accountNumber}
                  onChange={(e) => updateState({ 
                    ...state, 
                    paymentInfo: { ...state.paymentInfo, accountNumber: e.target.value } 
                  })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="accountName" className="text-xs text-muted-foreground">Atas Nama</Label>
                <Input
                  id="accountName"
                  placeholder="Contoh: Budi Santoso"
                  value={state.paymentInfo.name}
                  onChange={(e) => updateState({ 
                    ...state, 
                    paymentInfo: { ...state.paymentInfo, name: e.target.value } 
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daftar Peserta</Label>
            <Button variant="outline" size="sm" onClick={addParticipant} className="h-8 border-primary text-primary hover:bg-primary/10">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Peserta
            </Button>
          </div>

          <div className="space-y-3">
            {state.participants.map((p, i) => (
              <div key={p.id} className="flex items-center space-x-2 animate-in slide-in-from-left-4 fade-in">
                <Input
                  placeholder={`Nama Peserta ${i + 1}`}
                  value={p.name}
                  onChange={(e) => updateParticipantName(p.id, e.target.value)}
                  autoFocus={i === state.participants.length - 1}
                />
                <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeParticipant(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {state.participants.length === 0 && (
              <div className="text-center text-sm text-muted-foreground p-4 border rounded-md border-dashed">
                Belum ada peserta. Tambahkan minimal dua orang.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
