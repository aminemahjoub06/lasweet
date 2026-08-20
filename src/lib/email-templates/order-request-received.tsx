import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  OrderSummary,
  container,
  firstName,
  h1,
  lead,
  logo,
  main,
  signature,
  type RequestProps,
} from './_request-shared'

const OrderRequestReceived = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've received your order request — L&A Sweet</Preview>
    <Body style={main}>
      <Container style={container}>
        <img
          src="https://la-sweet-bne.com/branding/logo-square.png"
          alt="L&A Sweet"
          width="80"
          height="80"
          style={logo}
        />
        <Heading style={h1}>Hi {firstName(p.customerName) || 'there'},</Heading>
        <Text style={lead}>
          Thank you — we've received your order request <strong>#{p.orderNumber}</strong>.
        </Text>
        <Text style={lead}>
          <strong>This is not a confirmed order yet.</strong> We'll review availability and get
          back to you within 24 hours. No payment has been taken.
        </Text>
        <OrderSummary {...p} />
        <Text style={lead}>
          Once your request is approved you'll receive a secure payment link to lock it in.
        </Text>
        <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderRequestReceived,
  subject: (d: Record<string, any>) =>
    `We've received your order request #${d.orderNumber ?? ''} — L&A Sweet`,
  displayName: 'Customer — order request received',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    items: [{ name: 'Raspberry', qty: 4, price: 15 }],
    subtotal: 60,
    deliveryFee: 10,
    total: 70,
    deliveryMethod: 'delivery',
    deliveryAddress: '12 Example St, Brisbane',
    deliveryDate: '2026-08-20',
    deliveryTime: '14:00',
  },
} satisfies TemplateEntry
