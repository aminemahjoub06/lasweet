import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { container, h1, lead, line, main, money, type RequestProps } from './_request-shared'

const OwnerOrderRequestExpired = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Order request #${p.orderNumber ?? ''} expired unpaid`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Order request #{p.orderNumber} expired</Heading>
        <Text style={lead}>
          The accepted request was not paid within 24 hours. The delivery slot has been released
          and no stock was reserved.
        </Text>
        <Text style={line}>Customer: {p.customerName} · {p.customerEmail}</Text>
        <Text style={line}>
          {p.deliveryMethod === 'delivery' ? 'Delivery' : 'Pick-up'} {p.deliveryDate ?? ''}{' '}
          {p.deliveryTime ?? ''}
        </Text>
        <Text style={line}>Estimated total: {money(p.total)}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OwnerOrderRequestExpired,
  subject: (d: Record<string, any>) => `Order request #${d.orderNumber ?? ''} expired unpaid`,
  displayName: 'Owner — order request expired',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    deliveryMethod: 'delivery',
    deliveryDate: '2026-08-20',
    deliveryTime: '14:00',
    total: 70,
  },
} satisfies TemplateEntry
