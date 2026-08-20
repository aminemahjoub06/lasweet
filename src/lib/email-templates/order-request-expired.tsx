import * as React from 'react'
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import {
  container,
  firstName,
  h1,
  lead,
  link,
  logo,
  main,
  signature,
  type RequestProps,
} from './_request-shared'

const OrderRequestExpired = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your L&A Sweet reservation has expired</Preview>
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
          Your reservation for order request <strong>#{p.orderNumber}</strong> has expired — the
          payment link was valid for 24 hours and we haven't received your payment, so your slot
          has been released.
        </Text>
        <Text style={lead}>
          Still keen? You're very welcome to submit a new request at{' '}
          <Link href="https://la-sweet-bne.com" style={link}>
            la-sweet-bne.com
          </Link>
          . No payment has been taken.
        </Text>
        <Text style={signature}>Warm regards,<br />L&amp;A Sweet — Brisbane</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderRequestExpired,
  subject: (d: Record<string, any>) =>
    `Your reservation for order #${d.orderNumber ?? ''} has expired`,
  displayName: 'Customer — order request expired',
  previewData: { orderNumber: 'LAS-26-ABCDE', customerName: 'Jane Smith' },
} satisfies TemplateEntry
