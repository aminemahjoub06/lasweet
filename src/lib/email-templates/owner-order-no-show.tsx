import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  pickupDate?: string
  pickupTime?: string
  total?: number
  amountPaidOnline?: number
  paymentStatus?: string
}

const OwnerOrderNoShow = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order auto-cancelled — pick-up no-show</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Order #{p.orderNumber} auto-cancelled (no-show at {p.pickupTime ?? ''})
        </Heading>
        <Text style={value}>Pick-up date: {p.pickupDate ?? '—'}</Text>
        <Text style={value}>Pick-up time: {p.pickupTime ?? '—'}</Text>
        <Text style={value}>Customer: {p.customerName ?? '—'}</Text>
        <Text style={value}>Email: {p.customerEmail ?? '—'}</Text>
        <Text style={value}>Phone: {p.customerPhone ?? '—'}</Text>
        <Text style={value}>Order total: A${Number(p.total ?? 0).toFixed(2)}</Text>
        <Text style={value}>Paid online (kept): A${Number(p.amountPaidOnline ?? 0).toFixed(2)}</Text>
        <Text style={value}>Previous payment status: {p.paymentStatus ?? '—'}</Text>
        <Text style={value}>
          The order is now marked cancelled_no_show. No refund is due under the no-show policy.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OwnerOrderNoShow,
  subject: (d: Record<string, any>) =>
    `Order #${d.orderNumber ?? ''} auto-cancelled (no-show at ${d.pickupTime ?? ''})`,
  displayName: 'Owner — order auto-cancelled (no-show)',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '0400 000 000',
    pickupDate: '2026-08-09',
    pickupTime: '12:00',
    total: 60,
    amountPaidOnline: 30,
    paymentStatus: 'deposit_paid',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '20px', color: '#111', margin: '0 0 12px' }
const value: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '2px 0' }
