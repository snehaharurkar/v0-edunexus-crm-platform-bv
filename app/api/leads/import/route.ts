import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const leads = jsonData.map((row: any, index: number) => ({
      id: 'import_' + Date.now() + '_' + index,
      name: row['Name'] || row['name'] || 
            row['Full Name'] || row['full_name'] || 
            row['Student Name'] || '',
      email: row['Email'] || row['email'] || 
             row['Email ID'] || row['email_id'] || '',
      phone: row['Phone'] || row['phone'] || 
             row['Mobile'] || row['mobile'] || 
             row['Phone Number'] || '',
      source: row['Source'] || row['source'] || 
              row['Lead Source'] || 'Excel Import',
      course: row['Course'] || row['course'] || 
              row['Course Interest'] || '',
      priority: row['Priority'] || row['priority'] || 'warm',
      notes: row['Notes'] || row['notes'] || 
             row['Remarks'] || '',
      status: 'new',
      conversionScore: Math.floor(Math.random() * 40) + 30,
      daysInactive: 0,
      lastContact: new Date().toISOString().split('T')[0],
      assignedBde: row['Assigned BDE'] || row['BDE'] || 'Rahul Sharma',
      createdAt: new Date().toISOString(),
      activities: [{
        type: 'note',
        text: 'Lead imported from Excel',
        date: new Date().toLocaleString(),
        by: 'System'
      }]
    })).filter(lead => lead.name || lead.email || lead.phone)

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
      skipped: jsonData.length - leads.length
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    )
  }
}