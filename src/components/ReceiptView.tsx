import type { BillState } from "@/lib/types"
import { type BillCalculationResult } from "@/lib/calculation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Link as LinkIcon, Copy, Download, Pencil } from "lucide-react"
import { useState } from "react"
import { encodeBillState } from "@/lib/store"
import { Separator } from "@/components/ui/separator"
import { formatIDR } from "@/lib/format"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ReceiptViewProps {
  state: BillState
  result: BillCalculationResult
  onEdit?: () => void
  isReadOnly?: boolean
  onImport?: () => void
  onHome?: () => void
}

export function ReceiptView({ state, result, onEdit, isReadOnly = false, onImport, onHome }: ReceiptViewProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedRekening, setCopiedRekening] = useState(false)

  const handleCopy = async () => {
    // Generate URL with current location origin and pathname
    const baseUrl = `${window.location.origin}${window.location.pathname}`
    const billParam = encodeBillState(state)
    const fullUrl = `${baseUrl}?bill=${billParam}`
    
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
      alert("Gagal menyalin tautan ke clipboard.")
    }
  }

  const handleCopyRekening = async () => {
    if (!state.paymentInfo.accountNumber) return
    try {
      await navigator.clipboard.writeText(state.paymentInfo.accountNumber)
      setCopiedRekening(true)
      setTimeout(() => setCopiedRekening(false), 2000)
    } catch (err) {
      console.error("Failed to copy rekening", err)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg shadow-primary/5 relative">
      <CardHeader className="text-center pb-4">
        <div className="absolute left-4 top-4">
          {onHome && isReadOnly && (
            <Button variant="ghost" size="sm" onClick={onHome} className="text-muted-foreground hover:text-foreground hidden sm:flex">
                Buat Baru
            </Button>
          )}
        </div>

        {isReadOnly && (
          <div className="absolute right-4 top-4 flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy} 
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground" 
              title="Salin Tautan"
            >
              {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <LinkIcon className="h-3.5 w-3.5" />}
              <span className="ml-1.5 hidden sm:inline-block">{copiedLink ? "Tersalin" : "Tautan"}</span>
            </Button>
            {onImport && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onImport} 
                className="h-8 px-2 text-xs text-muted-foreground hover:text-amber-500 transition-colors" 
                title="Import & Edit"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="ml-1.5 hidden sm:inline-block">Import</span>
              </Button>
            )}
          </div>
        )}

        <CardTitle className="text-2xl font-bold pt-6 text-primary tracking-tight">
          {state.billName || "Tagihan"}
        </CardTitle>
        {state.date && (
          <p className="text-sm text-foreground/80 mt-1.5 font-medium">
            {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(state.date))}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-1">Total: {formatIDR(result.grandTotal)}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-0 text-foreground">
          <div className="font-semibold text-lg border-b pb-2 mb-2">Rincian Per Orang</div>
          {result.personTotals.length === 0 && (
            <div className="text-sm text-muted-foreground italic">Belum ada rincian.</div>
          )}
          <Accordion type="single" collapsible className="w-full">
            {result.personTotals.map((person) => {
              if (person.total === 0) return null
              return (
                <AccordionItem key={person.id} value={person.id} className="border-b last:border-b-0 border-border/50">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex flex-1 justify-between items-center pr-3">
                      <span>{person.name || "Tanpa Nama"}</span>
                      <span className="font-bold text-primary">{formatIDR(person.total)}</span>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-3 text-sm">
                    <div className="pl-6 space-y-1.5 pt-1">
                      {person.itemsBreakdown.map((bItem, i) => (
                        <div key={i} className="flex justify-between text-foreground/80 font-mono text-xs">
                          <span>- {bItem.name}</span>
                          <span>{formatIDR(bItem.splitPrice)}</span>
                        </div>
                      ))}
                      
                      {person.itemsBreakdown.length > 0 && <Separator className="my-2 opacity-30" />}
                      
                      <div className="flex justify-between text-muted-foreground text-xs font-medium">
                        <span>Subtotal</span>
                        <span>{formatIDR(person.subtotal)}</span>
                      </div>
                      
                      {person.surchargesShare > 0 && (
                        <div className="flex justify-between text-muted-foreground text-xs">
                          <span>Share Tambahan</span>
                          <span>{formatIDR(person.surchargesShare)}</span>
                        </div>
                      )}
                      
                      {person.discountsShare > 0 && (
                        <div className="flex justify-between text-destructive text-xs">
                          <span>Share Diskon</span>
                          <span>-{formatIDR(person.discountsShare)}</span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span>Subtotal Pesanan</span>
            <span>{formatIDR(result.totalItemsSubtotal)}</span>
          </div>
          {result.calculatedCustomCosts.map((cost, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{cost.name}</span>
              <span>{formatIDR(cost.amount)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-foreground">
            <span>Total Akhir</span>
            <span>{formatIDR(result.grandTotal)}</span>
          </div>
        </div>

        {(state.paymentInfo.bank || state.paymentInfo.accountNumber || state.paymentInfo.name) && (
          <div className="space-y-2 bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Info Pembayaran</div>
            <div className="flex flex-col space-y-1 text-sm font-medium">
              {(state.paymentInfo.bank || state.paymentInfo.accountNumber) && (
                <div className="flex items-center justify-between">
                  <span className="font-mono">
                    {state.paymentInfo.bank && `${state.paymentInfo.bank} - `}{state.paymentInfo.accountNumber}
                  </span>
                  {state.paymentInfo.accountNumber && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/20"
                      onClick={handleCopyRekening}
                    >
                      {copiedRekening ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-1 text-xs">{copiedRekening ? "Tersalin!" : "Salin"}</span>
                    </Button>
                  )}
                </div>
              )}
              {state.paymentInfo.name && (
                <div className="text-muted-foreground">
                  a.n. {state.paymentInfo.name}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {!isReadOnly && (
        <CardFooter className="flex-col sm:flex-row gap-3">
          {onEdit && (
            <Button onClick={onEdit} variant="outline" className="w-full sm:w-1/2 text-lg h-12">
              <Pencil className="mr-2 h-4 w-4" /> Edit Tagihan
            </Button>
          )}
          <Button 
            onClick={handleCopy} 
            className="w-full sm:w-1/2 text-lg h-12 shadow-lg transition-all hover:-translate-y-0.5" 
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" /> Tautan Tersalin!
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-5 w-5" /> Salin Tautan
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
