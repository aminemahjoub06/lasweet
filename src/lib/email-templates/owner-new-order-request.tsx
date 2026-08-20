import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  OrderSummary,
  button,
  buttonAlt,
  container,
  h1,
  label,
  lead,
  line,
  main,
  type RequestProps,
} from './_request-shared'

const OwnerNewOrderRequest = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New order request #${p.orderNumber ?? ''} — action needed`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New order request #{p.orderNumber}</Heading>
        <Text style={lead}>A customer has submitted an order request. Accept or decline below.</Text>
        <Text style={label}>Customer</Text>
        <Text style={line}>{p.customerName}</Text>
        <Text style={line}>{p.customerEmail}</Text>
        <Text style={line}>{p.customerPhone}</Text>
        {p.business ? <Text style={line}>{p.business}</Text> : null}
        {p.orderType ? <Text style={line}>Occasion: {p.orderType}</Text> : null}
        <OrderSummary {...p} />
        <Text style={{ margin: '24px 0 12px' }}>
          <Button style={button} href={p.acceptUrl}>
            ACCEPT REQUEST
          </Button>
        </Text>
        <Text style={{ margin: '0 0 12px' }}>
          <Button style={buttonAlt} href={p.declineUrl}>
            DECLINE REQUEST
          </Button>
        </Text>
        <Text style={line}>These links are valid for 7 days and can be used once.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OwnerNewOrderRequest,
  subject: (d: Record<string, any>) => `New order request #${d.orderNumber ?? ''} — action needed`,
  displayName: 'Owner — new order request',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '0400 000 000',
    items: [{ name: 'Raspberry', qty: 4, price: 15 }],
    subtotal: 60,
    deliveryFee: 10,
    total: 70,
    deliveryMethod: 'pickup',
    deliveryDate: '2026-08-20',
    deliveryTime: '14:00',
    acceptUrl: 'https://la-sweet-bne.com/api/public/orders/request-action?token=abc',
    declineUrl: 'https://la-sweet-bne.com/api/public/orders/request-action?token=def',
  },
} satisfies TemplateEntry
