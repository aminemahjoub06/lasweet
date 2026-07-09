import * as React from 'react'
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  customerName?: string
  orderNumber?: string
  leaveReviewUrl?: string
}

const firstName = (f?: string) => (f ?? '').trim().split(/\s+/)[0] || 'there'

const ReviewReminder = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>How was your L&A Sweet experience?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {firstName(p.customerName)},</Heading>
        <Text style={lead}>
          We hope you loved your L&amp;A Sweet desserts. If you have a spare
          moment, we'd be so grateful if you could share your experience — it
          helps other Brisbane customers discover us and keeps us motivated
          in the kitchen.
        </Text>
        <Text style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Link href={p.leaveReviewUrl} style={btn}>Leave a review</Link>
        </Text>
        <Text style={muted}>
          Ref: {p.orderNumber}
        </Text>
        <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ReviewReminder,
  subject: 'How was your L&A Sweet experience?',
  displayName: 'Customer — review reminder (J+2)',
  previewData: {
    customerName: 'Jane',
    orderNumber: 'LAS-26-ABCDE',
    leaveReviewUrl: 'https://la-sweet-bne.com/leave-review?order=LAS-26-ABCDE&email=jane@example.com',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '22px', color: '#111', margin: '0 0 8px' }
const lead: React.CSSProperties = { fontSize: '14px', color: '#444', lineHeight: '1.55', margin: '8px 0 16px' }
const btn: React.CSSProperties = { display: 'inline-block', background: '#b8860b', color: '#fff', padding: '12px 22px', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' as const }
const muted: React.CSSProperties = { fontSize: '12px', color: '#888', margin: '16px 0 0' }
const signature: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '18px 0 0' }
