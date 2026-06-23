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

interface Props {
  orderNumber?: string
  customerEmail?: string
  refundedAmount?: number
  originalTotal?: number
  reason?: string
  refundType?: 'full' | 'partial'
}

const OwnerOrderRefundedEmail = (p: Props) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        Refund processed — {p.orderNumber ?? ''} (A${(p.refundedAmount ?? 0).toFixed(2)})
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Refund processed</Heading>
          <Text style={muted}>Order reference</Text>
          <Text style={ref}>{p.orderNumber}</Text>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Customer</Text>
            <Text style={value}>{p.customerEmail}</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={label}>Refund</Text>
            <Text style={value}>
              Type: {p.refundType === 'partial' ? 'Partial refund' : 'Full refund'}
            </Text>
            <Text style={value}>
              Amount refunded: A${(p.refundedAmount ?? 0).toFixed(2)}
            </Text>
            <Text style={value}>
              Original total: A${(p.originalTotal ?? 0).toFixed(2)}
            </Text>
            {p.reason ? <Text style={value}>Reason: {p.reason}</Text> : null}
          </Section>

          <Hr style={hr} />

          <Text style={muted}>
            Processed automatically from Stripe. No action required.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OwnerOrderRefundedEmail,
  subject: (d: Record<string, any>) =>
    `Refund — ${d.orderNumber ?? ''} (A$${Number(d.refundedAmount ?? 0).toFixed(2)})`,
  displayName: 'Owner — order refunded',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    orderNumber: 'LAS-000123',
    customerEmail: 'customer@example.com',
    refundedAmount: 42.5,
    originalTotal: 42.5,
    reason: 'requested_by_customer',
    refundType: 'full' as const,
  },
}

const main = { backgroundColor: '#f6f6f6', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { backgroundColor: '#ffffff', padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { fontSize: '20px', margin: '0 0 12px' }
const muted = { color: '#888', fontSize: '12px', margin: '0' }
const ref = { fontSize: '18px', fontWeight: 600, margin: '4px 0 0' }
const hr = { borderColor: '#eee', margin: '16px 0' }
const label = { color: '#888', fontSize: '12px', textTransform: 'uppercase' as const, margin: '0 0 4px' }
const value = { fontSize: '14px', margin: '2px 0' }