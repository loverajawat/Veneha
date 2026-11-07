'use client';

import React, { useState } from 'react';
import {
  Button,
  CardBase,
  FeatureCard,
  YellowBoldBanner,
  Badge,
  TagChip,
  TextInput,
  PillTab,
  SegmentedTab,
  AccordionItem,
  Alert,
  Skeleton,
  Modal,
} from '@/components/ui';

export default function DesignSystemPreviewPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePill, setActivePill] = useState('one');
  const [activeSegment, setActiveSegment] = useState('one');

  return (
    <div className="min-h-screen bg-canvas text-ink p-8 max-w-6xl mx-auto space-y-12">
      <header className="border-b border-hairline pb-6">
        <h1 className="text-[36px] font-semibold tracking-tight text-ink">DESIGN.md Component Library Preview</h1>
        <p className="text-[16px] text-slate mt-2">
          Preview of all shared components and variants adhering to the Notion-inspired visual specification.
        </p>
      </header>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Buttons (8px radius rectangles)</h2>
        <div className="flex flex-wrap items-center gap-4 p-6 bg-surface rounded-lg border border-hairline">
          <Button variant="primary">button-primary (Purple)</Button>
          <Button variant="primary" disabled>
            Primary Disabled
          </Button>
          <Button variant="dark">button-dark (Black)</Button>
          <Button variant="secondary">button-secondary</Button>
          <Button variant="ghost">button-ghost</Button>
          <Button variant="link">button-link (Blue text)</Button>
        </div>

        {/* Buttons on Dark (Navy) */}
        <div className="p-6 bg-brand-navy rounded-lg space-y-3">
          <p className="text-on-dark-muted text-xs uppercase tracking-wider font-semibold">On Dark Navy Surfaces</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="on-dark">button-on-dark (White)</Button>
            <Button variant="secondary-on-dark">button-secondary-on-dark</Button>
            <Button variant="primary">Start Timed PPDT Practice</Button>
          </div>
        </div>
      </section>

      {/* Badges & Chips */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Badges & Tag Chips</h2>
        <div className="flex flex-wrap items-center gap-4 p-6 bg-surface rounded-lg border border-hairline">
          <Badge color="purple">Purple Badge</Badge>
          <Badge color="pink">Pink Badge</Badge>
          <Badge color="orange">Orange Badge</Badge>
          <TagChip color="purple">Lavender / Purple Tag</TagChip>
          <TagChip color="orange">Peach / Orange Tag</TagChip>
          <TagChip color="green">Mint / Green Tag</TagChip>
          <TagChip color="gray">Gray Tag</TagChip>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Form Input (44px, 8px radius)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-surface rounded-lg border border-hairline">
          <TextInput label="Cadet Callsign / Name" placeholder="e.g. Cadet Rahul Singh" />
          <TextInput
            label="API Key"
            placeholder="AIzaSy..."
            error="API key format is invalid"
            defaultValue="invalid_key"
          />
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Tabs (Pill & Segmented Underline)</h2>
        <div className="space-y-6 p-6 bg-surface rounded-lg border border-hairline">
          <div className="flex items-center gap-2">
            <PillTab active={activePill === 'one'} onClick={() => setActivePill('one')}>
              All (65)
            </PillTab>
            <PillTab active={activePill === 'two'} onClick={() => setActivePill('two')}>
              Not attempted (40)
            </PillTab>
            <PillTab active={activePill === 'three'} onClick={() => setActivePill('three')}>
              Attempted (25)
            </PillTab>
          </div>

          <div className="flex items-center border-b border-hairline">
            <SegmentedTab active={activeSegment === 'one'} onClick={() => setActiveSegment('one')}>
              PPDT Practice
            </SegmentedTab>
            <SegmentedTab active={activeSegment === 'two'} onClick={() => setActiveSegment('two')}>
              WAT Practice
            </SegmentedTab>
            <SegmentedTab active={activeSegment === 'three'} onClick={() => setActiveSegment('three')}>
              Past Attempts
            </SegmentedTab>
          </div>
        </div>
      </section>

      {/* Cards: Pastel Tints */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Pastel Feature Cards (12px radius, 32px padding)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard tint="sky">
            <h3 className="text-[18px] font-semibold text-ink">Learn (Sky Tint)</h3>
            <p className="text-[14px] text-charcoal mt-2">
              Understand the 5-day SSB procedure in English or Hindi.
            </p>
          </FeatureCard>
          <FeatureCard tint="peach">
            <h3 className="text-[18px] font-semibold text-ink">Practise (Peach Tint)</h3>
            <p className="text-[14px] text-charcoal mt-2">
              30 seconds to view picture, 4 minutes to write story on paper.
            </p>
          </FeatureCard>
          <FeatureCard tint="lavender">
            <h3 className="text-[18px] font-semibold text-ink">Get Feedback (Lavender Tint)</h3>
            <p className="text-[14px] text-charcoal mt-2">
              Photograph story and get instant AI assessment on OLQs.
            </p>
          </FeatureCard>
        </div>

        <YellowBoldBanner className="mt-4">
          <h3 className="text-[20px] font-semibold text-ink">Yellow Bold Banner Notice</h3>
          <p className="text-[14px] text-charcoal mt-1">
            Handwriting photos are deleted immediately after transcription. No images are stored.
          </p>
        </YellowBoldBanner>
      </section>

      {/* Alerts & Modals */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">Alerts & Dialogs</h2>
        <div className="space-y-3 p-6 bg-surface rounded-lg border border-hairline">
          <Alert type="success" title="Attempt Submitted">
            Your handwritten story has been transcribed and assessed successfully.
          </Alert>
          <Alert type="warning" title="Daily Limit Reached">
            You have used today&apos;s 5 PPDT attempts. Quota resets tonight at midnight.
          </Alert>
          <Alert type="error" title="Image Too Blurry">
            Sharpness score is below threshold. Please retake under bright light.
          </Alert>
          <div className="pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open Test Modal
            </Button>
          </div>
        </div>
      </section>

      {/* Accordion */}
      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold text-ink">FAQ Accordion</h2>
        <div className="space-y-2">
          <AccordionItem question="Is the AI feedback official?" defaultOpen>
            Feedback is AI-generated practice guidance based on SSB psychology assessment rubrics. It is not an
            official assessment or a prediction of selection.
          </AccordionItem>
          <AccordionItem question="Are my handwriting photos saved?">
            No. Your photos are processed in-memory for transcription and discarded immediately after OCR.
          </AccordionItem>
        </div>
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Modal Dialog"
        description="Modal with dimmed backdrop and shadow level 4."
      >
        <p className="text-[14px] text-charcoal mb-6">
          This modal demonstrates the 12px rounded container, dimmed overlay, and standard button actions.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(false)}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
