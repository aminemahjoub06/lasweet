import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{siteName}</Text>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>
          You requested to change your email address for {siteName} from{' '}
          <Link href={`mailto:${oldEmail}`} style={link}>
            {oldEmail}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>
          Click the button below to confirm this change:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
        <Text style={footer}>
          If you didn't request this change, please secure your account
          immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link: React.CSSProperties = {
  color: '#c9a14a',
  textDecoration: 'underline',
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
