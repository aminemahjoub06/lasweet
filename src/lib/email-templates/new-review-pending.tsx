import * as React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  reviewId?: string
  reviewerName?: string
  reviewerEmail?: string
  rating?: number
  comment?: string
  photoUrls?: string[]
  orderNumber?: string | null
  verifiedPurchase?: boolean
  approveUrl?: string
  rejectUrl?: string
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

const NewReviewPending = (p: Props) => {
  const rating = Math.max(1, Math.min(5, Number(p.rating ?? 0)))
  const photos = (p.photoUrls ?? []).slice(0, 3)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New {rating}★ review from {p.reviewerName ?? 'a customer'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New review to moderate</Heading>
          <Text style={rating_style}>{stars(rating)} — {rating}/5</Text>

          <Section style={card}>
            <Text style={label}>Reviewer</Text>
            <Text style={value}>
              {p.reviewerName} &lt;{p.reviewerEmail}&gt;{p.verifiedPurchase ? '  ✓ Verified purchase' : ''}
            </Text>
            {p.orderNumber ? <Text style={value}>Order: {p.orderNumber}</Text> : null}
          </Section>

          <Hr style={hr} />

          <Text style={label}>Comment</Text>
          <Text style={comment_style}>{p.comment}</Text>

          {photos.length > 0 ? (
            <>
              <Hr style={hr} />
              <Text style={label}>Photos ({photos.length})</Text>
              <Section>
                {photos.map((u, i) => (
                  <Img key={i} src={u} width={160} height={160} alt={`photo-${i + 1}`} style={thumb} />
                ))}
              </Section>
            </>
          ) : null}

          <Hr style={hr} />

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            <Link href={p.approveUrl} style={approveBtn}>Approve</Link>
            &nbsp;&nbsp;
            <Link href={p.rejectUrl} style={rejectBtn}>Reject</Link>
          </Section>

          <Text style={footer}>
            Magic links valid 7 days. You can also moderate in the admin dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: NewReviewPending,
  subject: (d: Record<string, any>) =>
    `New review submitted for L&A Sweet — ${d.rating ?? '?'} stars from ${d.reviewerName ?? 'a customer'}`,
  displayName: 'Admin — new review pending',
  to: 'l.asweetbne@gmail.com',
  previewData: {
    reviewerName: 'Jane Smith',
    reviewerEmail: 'jane@example.com',
    rating: 5,
    comment: 'Absolutely stunning desserts — the mango was next-level. Beautiful presentation and worth every cent.',
    photoUrls: [],
    orderNumber: 'LAS-26-ABCDE',
    verifiedPurchase: true,
    approveUrl: 'https://la-sweet-bne.com/api/public/reviews/moderate?token=xxx',
    rejectUrl: 'https://la-sweet-bne.com/api/public/reviews/moderate?token=yyy',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container: React.CSSProperties = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const h1: React.CSSProperties = { fontSize: '22px', color: '#111', margin: '0 0 8px' }
const rating_style: React.CSSProperties = { fontSize: '20px', color: '#b8860b', margin: '4px 0 12px', letterSpacing: '2px' }
const card: React.CSSProperties = { border: '1px solid #eee', padding: '12px 16px', margin: '0 0 8px' }
const label: React.CSSProperties = { fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.18em', margin: '8px 0 4px' }
const value: React.CSSProperties = { fontSize: '14px', color: '#222', margin: '2px 0' }
const comment_style: React.CSSProperties = { fontSize: '14px', color: '#222', lineHeight: '1.55', margin: '4px 0 8px', whiteSpace: 'pre-wrap' as const }
const thumb: React.CSSProperties = { display: 'inline-block', margin: '4px', border: '1px solid #eee', objectFit: 'cover' as const }
const approveBtn: React.CSSProperties = { display: 'inline-block', background: '#0a7a2b', color: '#fff', padding: '10px 18px', textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }
const rejectBtn: React.CSSProperties = { display: 'inline-block', background: '#7a1c1c', color: '#fff', padding: '10px 18px', textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }
const footer: React.CSSProperties = { fontSize: '12px', color: '#666', margin: '16px 0 0', textAlign: 'center' as const }
const hr: React.CSSProperties = { borderColor: '#eee', margin: '16px 0' }
