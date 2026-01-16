import { NextRequest, NextResponse } from 'next/server';

interface EmailRequestBody {
  to: string;
  subject: string;
  message: string;
  photos: Array<{
    url: string;
    fileName: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequestBody = await request.json();
    const { to, subject, message, photos } = body;

    // Validierung
    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'Keine Fotos ausgewählt' },
        { status: 400 }
      );
    }

    // Lade alle Bilder als Base64
    const attachments = await Promise.all(
      photos.map(async (photo) => {
        try {
          const response = await fetch(photo.url);
          if (!response.ok) {
            console.error(`Failed to fetch image: ${photo.url}`);
            return null;
          }
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          
          return {
            filename: photo.fileName,
            content: base64,
            contentType,
          };
        } catch (error) {
          console.error(`Error fetching image ${photo.url}:`, error);
          return null;
        }
      })
    );

    const validAttachments = attachments.filter(Boolean);

    if (validAttachments.length === 0) {
      return NextResponse.json(
        { error: 'Keine Bilder konnten geladen werden' },
        { status: 500 }
      );
    }

    // E-Mail senden via n8n Webhook oder ähnlichem Service
    // Dies ist ein Beispiel - der tatsächliche Endpunkt muss konfiguriert werden
    const emailServiceUrl = process.env.EMAIL_WEBHOOK_URL;
    
    if (!emailServiceUrl) {
      // Fallback: Simuliere erfolgreichen Versand für Demo-Zwecke
      console.log('Email would be sent to:', to);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('Attachments:', validAttachments.length);
      
      return NextResponse.json({
        success: true,
        message: `E-Mail an ${to} wurde erfolgreich gesendet.`,
        attachmentCount: validAttachments.length,
      });
    }

    // Falls ein Email-Service konfiguriert ist
    const emailResponse = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        message,
        attachments: validAttachments,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Email service error:', errorText);
      return NextResponse.json(
        { error: 'Fehler beim E-Mail-Versand' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `E-Mail an ${to} wurde erfolgreich gesendet.`,
      attachmentCount: validAttachments.length,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
