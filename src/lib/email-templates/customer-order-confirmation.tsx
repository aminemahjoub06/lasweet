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
  deliveryMethod?: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryDate?: string
  deliveryTime?: string
  items?: Item[]
  subtotal?: number
  deliveryFee?: number
  total?: number
  paymentMethod?: 'cash' | 'online'
  paymentStatus?: string
}

const SITE_URL = 'https://lasweet.lovable.app'

function firstName(full?: string) {
  if (!full) return ''
  const trimmed = full.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}

function formatAud(n: number) {
  return `A$${n.toFixed(2)}`
}

function formatDateAu(raw?: string) {
  if (!raw) return ''
  // Try to parse common machine formats and render as DD/MM/YYYY.
  // If it doesn't parse cleanly, return the original string unchanged.
  const d = new Date(raw)
  if (!isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }
  return raw
}

const CustomerOrderConfirmation = (p: Props) => {
  const items = p.items ?? []
  const isOnline = p.paymentMethod === 'online'
  const isDelivery = p.deliveryMethod === 'delivery'
  const fulfilmentLabel = isDelivery ? 'Delivery' : 'Pick-up'
  const greetingName = firstName(p.customerName) || 'there'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your L&A Sweet order is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hi {greetingName},</Heading>
          <Text style={lead}>
            Thank you for your order with L&amp;A Sweet. Your order has been
            received and registered. Here is a summary of your details.
          </Text>

          <Section style={card}>
            <Text style={muted}>Order reference</Text>
            <Text style={ref}>{p.orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={label}>Fulfilment</Text>
          <Text style={value}>Method: {fulfilmentLabel}</Text>
          {p.deliveryDate ? (
            <Text style={value}>
              {isDelivery ? 'Delivery date' : 'Pick-up date'}: {formatDateAu(p.deliveryDate)}
            </Text>
          ) : null}
          {p.deliveryTime ? (
            <Text style={value}>
              {isDelivery ? 'Delivery time' : 'Pick-up time'}: {p.deliveryTime}
            </Text>
          ) : null}
          {!isDelivery ? (
            <Text style={value}>Pick-up address: {PICKUP_ADDRESS}</Text>
          ) : null}
          {isDelivery && p.deliveryAddress ? (
            <Text style={value}>Delivery address: {p.deliveryAddress}</Text>
          ) : null}

          <Hr style={hr} />

          <Text style={label}>Items</Text>
          {items.map((i, idx) => (
            <Text key={idx} style={value}>
              {i.qty} × {i.name}
              {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ''} — {formatAud(i.price)} each ({formatAud(i.qty * i.price)})
            </Text>
          ))}

          <Hr style={hr} />

          <Text style={value}>Subtotal: {formatAud(p.subtotal ?? 0)}</Text>
          <Text style={value}>Delivery fee: {formatAud(p.deliveryFee ?? 0)}</Text>
          <Text style={totalRow}>Total: {formatAud(p.total ?? 0)} AUD</Text>

          <Hr style={hr} />

          <Text style={label}>Payment</Text>
          <Text style={value}>
            {isOnline
              ? 'Payment received — thank you.'
              : `Payment will be collected at ${isDelivery ? 'delivery' : 'pick-up'}.`}
          </Text>

          <Hr style={hr} />

          <Text style={label}>Storage and freshness</Text>
          <Text style={value}>
            Please keep your dessert refrigerated at 2–4°C and enjoy within 24 hours.
          </Text>

          <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>

          <Hr style={hr} />

          <Text style={footer}>
            By placing this order you accept our handling of your details as described in our{' '}
            <Link href={`${SITE_URL}/privacy`} style={link}>Privacy Policy</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CustomerOrderConfirmation,
  subject: (d: Record<string, any>) =>
    `Your L&A Sweet order #${d.orderNumber ?? ''} is confirmed`,
  displayName: 'Customer — order confirmation',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    deliveryMethod: 'delivery',
    deliveryAddress: '1 Queen St, Brisbane',
    deliveryDate: '2026-06-28',
    deliveryTime: '14:00',
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
const signature: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '16px 0 0' }
const link: React.CSSProperties = { color: '#b8860b', textDecoration: 'underline' }