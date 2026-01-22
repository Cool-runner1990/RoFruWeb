import { NextRequest, NextResponse } from 'next/server';

// n8n Webhook URL - Replace with your actual webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_EXCEL_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/excel-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      return NextResponse.json(
        { success: false, error: 'Ungültiges Dateiformat. Nur Excel-Dateien (.xlsx, .xls) erlaubt.' },
        { status: 400 }
      );
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Send to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileBase64: base64,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Fehler beim Verarbeiten der Datei. Bitte später erneut versuchen.' },
        { status: 500 }
      );
    }

    const n8nResult = await n8nResponse.json();

    return NextResponse.json({
      success: true,
      message: n8nResult.message || 'Import erfolgreich abgeschlossen',
      count: n8nResult.count || 0,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Note: Next.js App Router automatically handles body parsing
// File size limits can be set via next.config.js if needed
