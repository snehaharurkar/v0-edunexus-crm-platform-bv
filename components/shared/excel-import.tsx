"use client"

import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { NewLeadInput } from '@/contexts/leads-context'

interface ImportedLead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  course: string
  priority: string
  notes: string
  status: string
}

interface ExcelImportProps {
  addLead: (lead: NewLeadInput) => Promise<any>
}

export function ExcelImport({ addLead }: ExcelImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportedLead[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      const res = await fetch('/api/leads/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setPreview(data.leads)
        setStep('preview')
        toast.success(`Found ${data.leads.length} leads in file!`)
      } else {
        toast.error(data.error || 'Failed to read file')
      }
    } catch {
      toast.error('Failed to process file')
    }
    setLoading(false)
  }

  const handleImport = async () => {
    setImporting(true)
    let count = 0
    try {
      for (const lead of preview) {
        await addLead({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: (lead.source as any) || 'Referral',
          courseInterest: lead.course,
          priority: (lead.priority as any) || 'Warm',
          notes: lead.notes,
          assignedBde: 'Rahul Sharma',
        })
        count++
        await new Promise(r => setTimeout(r, 50))
      }
      setImportedCount(count)
      setStep('done')
      toast.success(`${count} leads imported successfully!`)
    } catch (err) {
      toast.error('Failed to import some leads')
      console.error('Import error:', err)
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview([])
    setStep('upload')
    setImportedCount(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = () => {
    setIsOpen(false)
    handleReset()
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)} className="border-green-500 text-green-600 hover:bg-green-50">
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Import Excel
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="font-bold text-lg">Import Leads from Excel</h2>
                <p className="text-sm text-gray-500">Upload your Excel or CSV file to bulk import leads</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {step === 'upload' && (
                <div className="space-y-4">
                  <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                        <p className="text-gray-600">Reading file...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="font-semibold text-gray-700">Click to upload Excel file</p>
                        <p className="text-sm text-gray-400">Supports .xlsx, .xls, .csv</p>
                        <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Choose File</Button>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </div>
              )}

              {step === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{preview.length} leads ready to import from {file?.name}</p>
                    <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-500">Upload different file</button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#','Name','Email','Phone','Course','Source','Priority'].map(h => (
                            <th key={h} className="text-left p-3 font-medium text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 10).map((lead, i) => (
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-gray-400">{i + 1}</td>
                            <td className="p-3 font-medium">{lead.name || '-'}</td>
                            <td className="p-3 text-gray-600">{lead.email || '-'}</td>
                            <td className="p-3 text-gray-600">{lead.phone || '-'}</td>
                            <td className="p-3 text-gray-600">{lead.course || '-'}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{lead.source}</span></td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">{lead.priority}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-700">All {preview.length} leads will be added with status "New Lead".</p>
                  </div>
                </div>
              )}

              {step === 'done' && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Import Successful!</h3>
                  <p className="text-gray-500">{importedCount} leads added to your pipeline</p>
                  <div className="flex gap-3 justify-center pt-4">
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                    <Button onClick={handleReset}>Import Another File</Button>
                  </div>
                </div>
              )}
            </div>

            {step === 'preview' && (
              <div className="border-t p-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">{preview.length} leads will be imported</p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                  <Button onClick={handleImport} disabled={importing} className="bg-green-600 hover:bg-green-700 text-white">
                    {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importing...</> : <><FileSpreadsheet className="h-4 w-4 mr-2" />Import {preview.length} Leads</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
