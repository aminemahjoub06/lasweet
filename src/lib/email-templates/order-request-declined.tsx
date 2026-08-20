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

const OrderRequestDeclined = (p: RequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>About your L&A Sweet order request</Preview>
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
          Thank you for your request <strong>#{p.orderNumber}</strong>
          {p.deliveryDate ? ` for ${p.deliveryDate}` : ''}. Unfortunately we can't take your order
          for this date — our current stock and premium ingredient availability are limited.
        </Text>
        <Text style={lead}>
          We'd love to make it up to you: feel free to submit a new request for another date at{' '}
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
  component: OrderRequestDeclined,
  subject: (d: Record<string, any>) => `About your L&A Sweet order request #${d.orderNumber ?? ''}`,
  displayName: 'Customer — order request declined',
  previewData: {
    orderNumber: 'LAS-26-ABCDE',
    customerName: 'Jane Smith',
    deliveryDate: '2026-08-20',
  },
} satisfies TemplateEntry
