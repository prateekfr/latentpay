import { Hero } from '../components/sections/hero'
import { Ticker } from '../components/sections/ticker'
import { HowItWorks } from '../components/sections/how-it-works'
import { AdPreview } from '../components/sections/ad-preview'
import { Features } from '../components/sections/features'
import { Stats } from '../components/sections/stats'
import { Platforms } from '../components/sections/platforms'
import { Testimonial } from '../components/sections/testimonial'
import { CTA } from '../components/sections/cta'

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <HowItWorks />
      <AdPreview />
      <Features />
      <Stats />
      <Platforms />
      <Testimonial />
      <CTA />
    </>
  )
}
