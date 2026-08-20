import type { ComponentType } from 'react'
import { template as ownerNewOrder } from './owner-new-order'
import { template as customerOrderConfirmation } from './customer-order-confirmation'
import { template as ownerOrderRefunded } from './owner-order-refunded'
import { template as newReviewPending } from './new-review-pending'
import { template as reviewReminder } from './review-reminder'
import { template as customerOrderNoShow } from './customer-order-no-show'
import { template as ownerOrderNoShow } from './owner-order-no-show'
import { template as orderRequestReceived } from './order-request-received'
import { template as ownerNewOrderRequest } from './owner-new-order-request'
import { template as orderRequestAccepted } from './order-request-accepted'
import { template as orderRequestDeclined } from './order-request-declined'
import { template as orderRequestExpired } from './order-request-expired'
import { template as ownerOrderRequestExpired } from './owner-order-request-expired'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  'owner-new-order': ownerNewOrder,
  'customer-order-confirmation': customerOrderConfirmation,
  'owner-order-refunded': ownerOrderRefunded,
  'new-review-pending': newReviewPending,
  'review-reminder': reviewReminder,
  'customer-order-no-show': customerOrderNoShow,
  'owner-order-no-show': ownerOrderNoShow,
  'order-request-received': orderRequestReceived,
  'owner-new-order-request': ownerNewOrderRequest,
  'order-request-accepted': orderRequestAccepted,
  'order-request-declined': orderRequestDeclined,
  'order-request-expired': orderRequestExpired,
  'owner-order-request-expired': ownerOrderRequestExpired,
}
