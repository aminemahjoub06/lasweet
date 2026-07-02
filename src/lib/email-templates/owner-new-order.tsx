import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import { PICKUP_ADDRESS } from '@/lib/config'

interface Item {
  name: string
  qty: number
  price: number
  sizeLabel?: string
}

interface Props {
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  business?: string
  deliveryMethod?: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryDate?: string
  deliveryTime?: string
  orderType?: string
  notes?: string
  items?: Item[]
  subtotal?: number
  deliveryFee?: number
  total?: number
  paymentMethod?: 'cash' | 'online'
  paymentStatus?: string
  paymentPlan?: 'full' | 'deposit_50'
  amountPaidOnline?: number
  balanceDueCash?: number
}

const OwnerNewOrderEmail = (p: Props) => {
  const items = p.items ?? []
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New L&A Sweet order — {p.orderNumber ?? ''}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New order received</Heading>
          <Text style={muted}>Order reference</Text>
          <Text style={ref}>{p.orderNumber}</Text>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Customer</Text>
            <Text style={value}>{p.customerName}</Text>
            <Text style={value}>{p.customerEmail}</Text>
            <Text style={value}>{p.customerPhone}</Text>
            {p.business ? <Text style={value}>{p.business}</Text> : null}
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Fulfilment</Text>
            <Text style={value}>
              {p.deliveryMethod === 'delivery' ? 'Delivery' : 'Pick-up'}
            </Text>
            {p.deliveryMethod === 'delivery' && p.deliveryAddress ? (
              <Text style={value}>{p.deliveryAddress}</Text>
            ) : null}
            {p.deliveryMethod !== 'delivery' ? (
              <Text style={value}>Pick-up address: {PICKUP_ADDRESS}</Text>
            ) : null}
            {p.deliveryDate ? <Text style={value}>Date: {p.deliveryDate}</Text> : null}
            {p.deliveryTime ? <Text style={value}>Time: {p.deliveryTime}</Text> : null}
            {p.orderType ? <Text style={value}>Occasion: {p.orderType}</Text> : null}
            {p.notes ? <Text style={value}>Notes: {p.notes}</Text> : null}
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Items</Text>
            {items.map((i, idx) => (
              <Text key={idx} style={value}>
                {i.qty} × {i.name}
                {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ''} — ${(i.qty * i.price).toFixed(2)}
              </Text>
            ))}
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={value}>Subtotal: ${(p.subtotal ?? 0).toFixed(2)}</Text>
            <Text style={value}>Delivery fee: ${(p.deliveryFee ?? 0).toFixed(2)}</Text>
            <Text style={total}>Total: ${(p.total ?? 0).toFixed(2)}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={value}>
            Payment: {(p.paymentMethod ?? '').toUpperCase()} — {p.paymentStatus}
          </Text>
          {p.paymentPlan === 'deposit_50' ? (
            <>
              <Text style={value}>Plan: 50% deposit</Text>
              <Text style={value}>Paid online (Stripe): ${(p.amountPaidOnline ?? 0).toFixed(2)}</Text>
              <Text style={total}>
                Cash to collect on {p.deliveryMethod === 'delivery' ? 'delivery' : 'pick-up'}: ${(p.balanceDueCash ?? 0).toFixed(2)}
              </Text>
            </>
          ) : p.paymentMethod === 'online' ? (
            <Text style={value}>Paid in full online: ${(p.amountPaidOnline ?? p.total ?? 0).toFixed(2)} — nothing to collect</Text>
          ) : (
            <Text style={total}>
              Cash to collect on {p.deliveryMethod === 'delivery' ? 'delivery' : 'pick-up'}: ${(p.balanceDueCash ?? p.total ?? 0).toFixed(2)}
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OwnerNewOrderEmail,
  subject: (d: Record<string, any>) =>
    `New order — ${d.orderNumber ?? ''} (${d.paymentMethod === 'online' ? 'Online' : 'Cash'})`,
  displayName: 'Owner — new order',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+61 400 000 000',
    deliveryMethod: 'delivery',
    deliveryAddress: '1 Queen St, Brisbane',
    items: [{ name: 'Raspberry', qty: 4, price: 15 }],
    subtotal: 60,
    deliveryFee: 10,
    total: 70,
    paymentMethod: 'online',
    paymentStatus: 'paid',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '22px', color: '#111', margin: '0 0 8px' }
const muted: React.CSSProperties = { fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '8px 0 4px' }
const ref: React.CSSProperties = { fontSize: '20px', color: '#b8860b', margin: '0 0 8px', letterSpacing: '0.1em' }
const label: React.CSSProperties = { fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 6px' }
const value: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '2px 0' }
const total: React.CSSProperties = { fontSize: '16px', color: '#111', fontWeight: 600, margin: '6px 0 0' }
const hr: React.CSSProperties = { borderColor: '#eee', margin: '16px 0' }