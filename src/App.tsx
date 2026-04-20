import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import type { BillState } from "@/lib/types"
import { defaultState, decodeBillState } from "@/lib/store"
import { calculateBill } from "@/lib/calculation"
import { saveBill, type BillRecord } from "@/lib/db"

import { BillSetup } from "@/components/BillSetup"
import { ItemsInput } from "@/components/ItemsInput"
import { ExtraCosts } from "@/components/ExtraCosts"
import { ReceiptView } from "@/components/ReceiptView"
import { HistoryList } from "@/components/HistoryList"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, History, ChevronLeft } from "lucide-react"

export function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [state, setState] = useState<BillState>(defaultState)
  const [currentBillId, setCurrentBillId] = useState<string>(crypto.randomUUID())
  const [mode, setMode] = useState<"setup" | "items" | "result">("setup")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  
  // Track if we are in read-only mode (loaded from URL param on first render)
  const [isReadOnly, setIsReadOnly] = useState(false)

  // Initialize from URL param if present
  useEffect(() => {
    const billParam = searchParams.get("bill")
    if (billParam) {
      const decodedState = decodeBillState(billParam)
      if (decodedState) {
        setState(decodedState)
        setMode("result")
        setIsReadOnly(true)
      }
    }
  }, [searchParams])

  const handleNextToItems = () => {
    if (!state.billName.trim()) {
      alert("Mohon isi Nama Tagihan.")
      return
    }
    if (state.participants.length < 2) {
      alert("Mohon tambahkan minimal dua peserta.")
      return
    }
    setMode("items")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleShowResult = async () => {
    if (state.items.length === 0) {
      alert("Mohon tambahkan minimal satu barang/pesanan.")
      return
    }

    // Auto-save to IndexedDB
    try {
      const calculated = calculateBill(state)
      const record: BillRecord = {
        id: currentBillId,
        date: state.date,
        billName: state.billName,
        grandTotal: calculated.grandTotal,
        state: state,
        createdAt: Date.now()
      }
      await saveBill(record)
    } catch (e) {
      console.error("Failed auto-saving to DB:", e)
    }

    setMode("result")
    setIsReadOnly(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBackToEdit = () => {
    setMode("items")
    if (searchParams.has("bill")) {
      setSearchParams(new URLSearchParams())
      window.history.replaceState(null, "", window.location.pathname)
      setIsReadOnly(false)
    }
  }

  const handleGoHome = () => {
    if (searchParams.has("bill")) {
      setSearchParams(new URLSearchParams())
      window.history.replaceState(null, "", window.location.pathname)
    }
    setState({ ...defaultState, date: new Date().toISOString().split("T")[0] })
    setCurrentBillId(crypto.randomUUID())
    setIsReadOnly(false)
    setMode("setup")
  }

  const handleImportState = async () => {
    const newId = crypto.randomUUID()
    try {
      const calculated = calculateBill(state)
      const record: BillRecord = {
        id: newId,
        date: state.date,
        billName: state.billName,
        grandTotal: calculated.grandTotal,
        state: state,
        createdAt: Date.now()
      }
      await saveBill(record)
    } catch (e) {
      console.error("Failed importing to DB:", e)
    }

    setCurrentBillId(newId)
    setMode("setup")
    setIsReadOnly(false)
    if (searchParams.has("bill")) {
      setSearchParams(new URLSearchParams())
      window.history.replaceState(null, "", window.location.pathname)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSelectHistory = (record: BillRecord) => {
    setState(record.state)
    setCurrentBillId(record.id)
    setMode("result")
    setIsHistoryOpen(false)
  }

  // Render Receipt View
  if (mode === "result") {
    const calculationResult = calculateBill(state)
    return (
      <div className="min-h-svh bg-background text-foreground py-8 px-4 sm:px-6">
        <ReceiptView 
          state={state} 
          result={calculationResult} 
          onEdit={isReadOnly ? undefined : handleBackToEdit} 
          isReadOnly={isReadOnly}
          onImport={isReadOnly ? handleImportState : undefined}
          onHome={isReadOnly ? handleGoHome : undefined}
        />
      </div>
    )
  }

  // Render Items Mode
  if (mode === "items") {
    return (
      <div className="min-h-svh bg-background text-foreground py-8 px-4 sm:px-6 pb-24">
        <div className="max-w-[40rem] mx-auto space-y-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => setMode("setup")} className="text-muted-foreground mr-4">
              <ChevronLeft className="h-5 w-5 mr-1" /> Kembali
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Isi Pesanan
            </h1>
          </div>

          <div className="space-y-8">
            <ItemsInput state={state} updateState={setState} />
            <ExtraCosts state={state} updateState={setState} />
          </div>

          <Separator className="my-8" />

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-8 h-12 text-lg"
              onClick={handleShowResult}
            >
              Hitung Tagihan <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render Edit Mode (Creator View)
  return (
    <div className="min-h-svh bg-background text-foreground py-8 px-4 sm:px-6 pb-24">
      <div className="max-w-[40rem] mx-auto space-y-6">
        
        <div className="flex justify-between items-center px-1 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 tracking-tight tracking-[-1px]">
            Split Bill
          </h1>
          <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Riwayat
          </Button>
        </div>

        <HistoryList 
          open={isHistoryOpen} 
          onOpenChange={setIsHistoryOpen} 
          onSelect={handleSelectHistory} 
        />

        <div className="space-y-8">
          <BillSetup state={state} updateState={setState} />
        </div>

        <Separator className="my-8" />

        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 h-12 text-lg"
            onClick={handleNextToItems}
          >
            Lanjut ke Pesanan <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
