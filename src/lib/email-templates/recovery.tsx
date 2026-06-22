import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{siteName}</Text>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click
          the button below to choose a new password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const button: React.CSSProperties = {
  backgroundColor: '#c9a14a',
  color: '#0a0806',
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '6px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#888',
  margin: '28px 0 0',
}
