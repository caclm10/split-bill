import { useState, useEffect } from "react"
import { type BillRecord, getAllBills, deleteBill } from "@/lib/db"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatIDR } from "@/lib/format"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (record: BillRecord) => void
}

export function HistoryList({ open, onOpenChange, onSelect }: HistoryListProps) {
  const [bills, setBills] = useState<BillRecord[]>([])

  const loadBills = async () => {
    const data = await getAllBills()
    setBills(data)
  }

  // Load right when dialog toggles open
  useEffect(() => {
    if (open) {
      loadBills()
    }
  }, [open])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent triggering the row select
    if (confirm("Hapus tagihan ini dari riwayat?")) {
      await deleteBill(id)
      await loadBills()
    }
  }

  const handleSelect = (record: BillRecord) => {
    onSelect(record)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] p-4 sm:p-6 mx-auto rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">Riwayat Tagihan</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] max-h-[500px] w-full rounded-md pr-4">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <p>Belum ada riwayat tagihan tersimpan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  onClick={() => handleSelect(bill)}
                  className="flex items-center justify-between p-3 border border-border/50 bg-card hover:bg-muted/50 transition-colors rounded-lg cursor-pointer group"
                >
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-[250px]">
                      {bill.billName || "Tagihan Tanpa Nama"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(bill.date))}</span>
                      <span>•</span>
                      <span className="font-medium">{formatIDR(bill.grandTotal)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                    onClick={(e) => handleDelete(e, bill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
