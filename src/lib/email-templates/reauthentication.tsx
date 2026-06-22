import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>L&A Sweet</Text>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, Arial, sans-serif',
}
const container: React.CSSProperties = {
  padding: '32px 24px',
  maxWidth: '520px',
  margin: '0 auto',
}
const brand: React.CSSProperties = {
  fontFamily: '"Cormorant Garamond", Georgia, serif',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#c9a14a',
  margin: '0 0 24px',
}
const h1: React.CSSProperties = {
  fontFamily: '"Cormorant Garamond", Georgia, serif',
  fontSize: '26px',
  fontWeight: 500,
  color: '#0a0806',
  margin: '0 0 20px',
}
const text: React.CSSProperties = {
  fontSize: '14px',
  color: '#444',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle: React.CSSProperties = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '0.12em',
  color: '#0a0806',
  backgroundColor: '#f6f3ee',
  padding: '16px 24px',
  borderRadius: '6px',
  display: 'inline-block',
  margin: '0 0 24px',
}
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#888',
  margin: '28px 0 0',
}
