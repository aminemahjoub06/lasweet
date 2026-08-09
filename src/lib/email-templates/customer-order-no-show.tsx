import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  orderNumber?: string
  customerName?: string
  pickupDate?: string
  pickupTime?: string
}

function firstName(full?: string) {
  const trimmed = (full ?? '').trim()
  return trimmed ? trimmed.split(/\s+/)[0] : ''
}

const CustomerOrderNoShow = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your L&A Sweet order has been cancelled — no-show</Preview>
    <Body style={main}>
      <Container style={container}>
        <img
          src="https://la-sweet-bne.com/branding/logo-square.png"
          alt="L&A Sweet"
          width="80"
          height="80"
          style={{ display: 'block', margin: '0 auto 24px auto' }}
        />
        <Heading style={h1}>Hi {firstName(p.customerName) || 'there'},</Heading>
        <Text style={lead}>
          Your order <strong>#{p.orderNumber}</strong> was booked for pick-up
          {p.pickupDate ? ` on ${p.pickupDate}` : ''}
          {p.pickupTime ? ` at ${p.pickupTime}` : ''}. More than one hour has passed since your
          chosen time and we haven't heard from you, so the order has now been cancelled.
        </Text>
        <Text style={lead}>
          As set out in our Terms &amp; Conditions, uncollected orders are cancelled after a
          one-hour grace period and the amount already paid — whether a deposit or the full
          payment — is not refundable. Our desserts are handcrafted fresh for your slot and cannot
          be resold.
        </Text>
        <Hr style={hr} />
        <Text style={lead}>
          If something came up, we'd still love to hear from you — just reply to this email or get
          in touch at{' '}
          <Link href="mailto:l.asweetbne@gmail.com" style={link}>l.asweetbne@gmail.com</Link>{' '}
          and we'll do our best to help with your next order.
        </Text>
        <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CustomerOrderNoShow,
  subject: (d: Record<string, any>) =>
    `Your L&A Sweet order #${d.orderNumber ?? ''} has been cancelled — no-show`,
  displayName: 'Customer — order cancelled (no-show)',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    pickupDate: '2026-08-09',
    pickupTime: '12:00',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '24px', color: '#111', margin: '0 0 8px' }
const lead: React.CSSProperties = { fontSize: '14px', color: '#444', margin: '0 0 16px', lineHeight: '1.6' }
const hr: React.CSSProperties = { borderColor: '#eee', margin: '16px 0' }
const signature: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '16px 0 0' }
const link: React.CSSProperties = { color: '#b8860b', textDecoration: 'underline' }
