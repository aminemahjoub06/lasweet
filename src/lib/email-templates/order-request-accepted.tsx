import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  OrderSummary,
  button,
  container,
  firstName,
  h1,
  lead,
  line,
  logo,
  main,
  signature,
  type RequestProps,
} from './_request-shared'

const OrderRequestAccepted = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Great news — your L&A Sweet order is available</Preview>
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
          Great news — your order is confirmed available! Complete your payment to lock it in.
        </Text>
        <OrderSummary {...p} />
        <Text style={{ margin: '24px 0 12px' }}>
          <Button style={button} href={p.payUrl}>
            COMPLETE MY PAYMENT
          </Button>
        </Text>
        <Text style={line}>
          You can pay a 50% deposit (balance in cash on the day) or the full amount online.
        </Text>
        <Text style={lead}>
          This payment link expires in 24 hours. After that your slot is released and the request
          is cancelled.
        </Text>
        <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderRequestAccepted,
  subject: (d: Record<string, any>) =>
    `Your order request #${d.orderNumber ?? ''} is approved — complete your payment`,
  displayName: 'Customer — order request accepted',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    items: [{ name: 'Raspberry', qty: 4, price: 15 }],
    subtotal: 60,
    deliveryFee: 10,
    total: 70,
    deliveryMethod: 'pickup',
    deliveryDate: '2026-08-20',
    deliveryTime: '14:00',
    payUrl: 'https://la-sweet-bne.com/pay/LAS-26-ABCDE?token=abc',
  },
} satisfies TemplateEntry
