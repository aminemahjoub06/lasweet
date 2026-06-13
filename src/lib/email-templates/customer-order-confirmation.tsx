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

interface Item {
  name: string
  qty: number
  price: number
  sizeLabel?: string
}

interface Props {
  orderNumber?: string
  customerName?: string
  deliveryMethod?: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryDate?: string
  items?: Item[]
  subtotal?: number
  deliveryFee?: number
  total?: number
  paymentMethod?: 'cash' | 'online'
  paymentStatus?: string
}

const CustomerOrderConfirmation = (p: Props) => {
  const items = p.items ?? []
  const paid = p.paymentStatus === 'paid'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Thank you for your L&A Sweet order</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you{p.customerName ? `, ${p.customerName}` : ''}</Heading>
          <Text style={lead}>
            We&apos;ve received your order at L&amp;A Sweet. Here are your details.
          </Text>

          <Section style={card}>
            <Text style={muted}>Order reference</Text>
            <Text style={ref}>{p.orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={label}>Fulfilment</Text>
          <Text style={value}>
            {p.deliveryMethod === 'delivery' ? 'Delivery' : 'Pick-up'}
          </Text>
          {p.deliveryMethod === 'delivery' && p.deliveryAddress ? (
            <Text style={value}>{p.deliveryAddress}</Text>
          ) : null}
          {p.deliveryDate ? <Text style={value}>Date: {p.deliveryDate}</Text> : null}

          <Hr style={hr} />

          <Text style={label}>Items</Text>
          {items.map((i, idx) => (
            <Text key={idx} style={value}>
              {i.qty} × {i.name}
              {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ''} — ${(i.qty * i.price).toFixed(2)}
            </Text>
          ))}

          <Hr style={hr} />

          <Text style={value}>Subtotal: ${(p.subtotal ?? 0).toFixed(2)}</Text>
          <Text style={value}>Delivery fee: ${(p.deliveryFee ?? 0).toFixed(2)}</Text>
          <Text style={totalRow}>Total: ${(p.total ?? 0).toFixed(2)}</Text>

          <Hr style={hr} />

          <Text style={value}>
            Payment: {p.paymentMethod === 'cash'
              ? 'Cash on pick-up or delivery'
              : paid
                ? 'Paid online'
                : 'Awaiting confirmation'}
          </Text>

          <Text style={footer}>
            We&apos;ll be in touch shortly to confirm the final details. Reply to this email
            with any questions.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CustomerOrderConfirmation,
  subject: (d: Record<string, any>) =>
    `Your L&A Sweet order — ${d.orderNumber ?? ''}`,
  displayName: 'Customer — order confirmation',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane',
    deliveryMethod: 'delivery',
    deliveryAddress: '1 Queen St, Brisbane',
    items: [{ name: 'Raspberry', qty: 4, price: 18 }],
    subtotal: 72,
    deliveryFee: 10,
    total: 82,
    paymentMethod: 'online',
    paymentStatus: 'paid',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '24px', color: '#111', margin: '0 0 8px' }
const lead: React.CSSProperties = { fontSize: '14px', color: '#444', margin: '0 0 16px' }
const card: React.CSSProperties = { border: '1px solid #eee', padding: '12px 16px', margin: '0 0 8px' }
const muted: React.CSSProperties = { fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 4px' }
const ref: React.CSSProperties = { fontSize: '20px', color: '#b8860b', margin: '0', letterSpacing: '0.1em' }
const label: React.CSSProperties = { fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '8px 0 6px' }
const value: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '2px 0' }
const totalRow: React.CSSProperties = { fontSize: '16px', color: '#111', fontWeight: 600, margin: '6px 0 0' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#666', margin: '16px 0 0' }
const hr: React.CSSProperties = { borderColor: '#eee', margin: '16px 0' }