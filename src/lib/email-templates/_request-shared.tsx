import * as React from 'react'
import { Hr, Text } from '@react-email/components'

export interface RequestItem {
  name?: string
  qty?: number
  price?: number
  sizeLabel?: string
  prefix?: string
  suffix?: string
}

export interface RequestProps {
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  business?: string
  orderType?: string
  notes?: string
  items?: RequestItem[]
  subtotal?: number
  deliveryFee?: number
  total?: number
  deliveryMethod?: string
  deliveryAddress?: string
  deliveryDate?: string
  deliveryTime?: string
  giftIncluded?: boolean
  acceptUrl?: string
  declineUrl?: string
  payUrl?: string
  expiresAt?: string
}

export function firstName(full?: string) {
  const trimmed = (full ?? '').trim()
  return trimmed ? trimmed.split(/\s+/)[0] : ''
}

export function money(n?: number) {
  return `A$${Number(n ?? 0).toFixed(2)}`
}

export const OrderSummary = (p: RequestProps) => (
  <>
    <Hr style={hr} />
    <Text style={label}>Your request</Text>
    {(p.items ?? []).map((i, idx) => (
      <Text key={idx} style={line}>
        {i.qty} × {i.name}
        {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ''} — {money((i.qty ?? 0) * (i.price ?? 0))}
      </Text>
    ))}
    {p.giftIncluded ? <Text style={line}>Gift: 2 mystery pieces — FREE</Text> : null}
    <Text style={line}>Subtotal: {money(p.subtotal)}</Text>
    <Text style={line}>
      Delivery fee: {Number(p.deliveryFee ?? 0) === 0 ? 'Free' : money(p.deliveryFee)}
    </Text>
    <Text style={totalLine}>Estimated total: {money(p.total)}</Text>
    <Hr style={hr} />
    <Text style={label}>
      {p.deliveryMethod === 'delivery' ? 'Delivery' : 'Pick-up'} details
    </Text>
    <Text style={line}>
      {p.deliveryDate ?? ''} {p.deliveryTime ? `at ${p.deliveryTime}` : ''}
    </Text>
    {p.deliveryMethod === 'delivery' ? (
      <Text style={line}>{p.deliveryAddress ?? ''}</Text>
    ) : (
      <Text style={line}>803b Stanley Street, Woolloongabba QLD 4102 (next to Coles)</Text>
    )}
    {p.notes ? <Text style={line}>Notes: “{p.notes}”</Text> : null}
  </>
)

export const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, sans-serif',
}
export const container: React.CSSProperties = {
  padding: '24px',
  maxWidth: '560px',
  margin: '0 auto',
}
export const logo: React.CSSProperties = {
  display: 'block',
  margin: '0 auto 24px auto',
}
export const h1: React.CSSProperties = { fontSize: '24px', color: '#111', margin: '0 0 8px' }
export const lead: React.CSSProperties = {
  fontSize: '14px',
  color: '#444',
  margin: '0 0 16px',
  lineHeight: '1.6',
}
export const label: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#b8860b',
  margin: '0 0 8px',
}
export const line: React.CSSProperties = {
  fontSize: '13px',
  color: '#444',
  margin: '0 0 4px',
  lineHeight: '1.5',
}
export const totalLine: React.CSSProperties = {
  fontSize: '15px',
  color: '#111',
  fontWeight: 600,
  margin: '8px 0 0',
}
export const hr: React.CSSProperties = { borderColor: '#eee', margin: '16px 0' }
export const signature: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '16px 0 0' }
export const link: React.CSSProperties = { color: '#b8860b', textDecoration: 'underline' }
export const button: React.CSSProperties = {
  backgroundColor: '#c9a14a',
  color: '#0a0806',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '4px',
  padding: '14px 26px',
  textDecoration: 'none',
  display: 'inline-block',
}
export const buttonAlt: React.CSSProperties = {
  ...button,
  backgroundColor: '#8a8a8a',
  color: '#ffffff',
}
