import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Trouver l'utilisateur par email
    const { data: user, error: userError } = await supabaseAdmin
      .from('admin_users')
      .select('id, username, email')
      .eq('email', email)
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      // Par sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json(
        { 
          success: true, 
          message: 'If this email exists, a reset link has been sent' 
        },
        { status: 200 }
      )
    }

    // Générer un token aléatoire sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Expire dans 1 heure

    // Stocker le token dans la base de données
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({
        reset_token: resetToken,
        reset_token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating reset token:', updateError)
      return NextResponse.json(
        { error: 'Error generating reset token' },
        { status: 500 }
      )
    }

    // Construire l'URL de réinitialisation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`

    // Envoyer l'email via Resend
    const salonName = process.env.NEXT_PUBLIC_SALON_NAME || 'Elite Services'
    const salonEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    try {
      await resend.emails.send({
        from: `${salonName} <${salonEmail}>`,
        to: user.email,
        subject: `🔐 Password Reset - ${salonName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); color: #D4AF37; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${user.username}</strong>,</p>
                
                <p>We received a request to reset your password for your administrator account.</p>
                
                <p>Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This link is valid for <strong>1 hour</strong></li>
                    <li>If you didn't request this reset, ignore this email</li>
                    <li>Your password will remain unchanged until you create a new one</li>
                  </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-size: 12px;">
                  ${resetUrl}
                </p>
                
                <p style="margin-top: 30px; color: #666;">
                  If you have any questions, please contact us.
                </p>
              </div>
              <div class="footer">
                <p>${salonName} © ${new Date().getFullYear()}</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      console.log('✅ Reset email sent to:', user.email)
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError)
      // On continue quand même pour ne pas révéler l'erreur
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'If this email exists, a reset link has been sent'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
