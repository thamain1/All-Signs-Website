import { Link } from 'react-router-dom';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const Step = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
  <div className="flex gap-4 mb-5">
    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">{num}</div>
    <div>
      <div className="font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{children}</div>
    </div>
  </div>
);

export function Installation() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/resources" className="text-green-600 hover:text-green-700 text-sm font-medium">← Back to Resources</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Installation Tips</h1>
            <p className="text-gray-600 mt-1">Step-by-step instructions for every sign type</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">

          {/* Banners */}
          <Section title="Vinyl Banners">
            <p className="text-gray-600 mb-5">All banners ship with reinforced hemmed edges and brass grommets placed every 2 feet. Here's how to hang them securely.</p>

            <h3 className="font-semibold text-gray-900 mb-3">Hanging with Rope or Bungee Cord</h3>
            <Step num={1} title="Select your anchor points">
              Identify two solid anchor points (fence posts, poles, or eye-bolts in a wall) that match the width of your banner. Ensure both points are at the same height.
            </Step>
            <Step num={2} title="Thread rope through grommets">
              Use nylon rope, bungee cord, or zip ties through the corner grommets. Avoid metal wire — it can tear grommets in high wind.
            </Step>
            <Step num={3} title="Tension evenly">
              Pull each side taut but not stretched. Overly tight mounting stresses the grommets. For large banners, add additional attachment points at every grommet along the top edge.
            </Step>
            <Step num={4} title="Check after the first wind event">
              Inspect attachment points and re-tension if needed after the first storm. Banners can loosen as material settles.
            </Step>

            <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-5">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-900">
                <strong>Wind tip:</strong> In high-wind areas, order a mesh vinyl banner or ask us to add wind slits to a standard banner. Solid vinyl can act as a sail and tear or pull anchors free.
              </p>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Using a Banner Stand</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {[
                'Retractable stands: pull the graphic up from the base and secure the top pole. Most stands also include a carrying bag.',
                'X-frame stands: assemble the X frame first, then attach bungee hooks to the four corners of the banner.',
                'L-banner stands: insert the bottom pole into the banner sleeve, attach to the vertical pole, and extend to full height.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </Section>

          {/* Yard Signs */}
          <Section title="Yard Signs (Coroplast)">
            <p className="text-gray-600 mb-5">Coroplast yard signs install quickly with wire H-stakes (included with most orders).</p>
            <Step num={1} title="Check the ground">
              Avoid areas with buried utilities. Call 811 (US Dig Safe line) before staking into unknown ground.
            </Step>
            <Step num={2} title="Insert the H-stake">
              Push the two legs of the wire H-stake into the ground approximately 6–8 inches. The cross bar of the "H" should be at ground level.
            </Step>
            <Step num={3} title="Slide the sign onto the stake">
              Slip the corrugated flutes of the sign panel over the two upright stake legs. The sign should slide down snugly over both legs.
            </Step>
            <Step num={4} title="Position for visibility">
              Face the sign toward oncoming traffic or foot traffic. For roadside placement, check local ordinances — most municipalities have setback requirements from the curb.
            </Step>
            <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Hard soil tip:</strong> Use a mallet or rubber hammer to drive the stake. Pre-punch a pilot hole with a screwdriver in very hard ground.
              </p>
            </div>
          </Section>

          {/* Rigid Signs */}
          <Section title="Aluminum & Rigid Signs">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Wall Mounting</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {[
                    'Use appropriate anchors for your wall type — drywall anchors for interior walls, masonry anchors for concrete/brick.',
                    'Pre-drill holes in the sign panel if not already provided. Use a #8 or #10 screw with a washer to distribute load.',
                    'For ACM panels larger than 24"×36", use at least 4 mounting points to prevent bowing.',
                    'Apply foam mounting tape between the sign and wall to prevent scratching and to create a slight gap for airflow.',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Standoff Mounting (Floating Look)</h3>
                <Step num={1} title="Mark drill points">
                  Hold the sign against the wall and mark the four corner drill points with a pencil. Use a level to ensure the marks are straight.
                </Step>
                <Step num={2} title="Install wall anchors">
                  Drill into the wall and install appropriate anchors (masonry, toggle bolt, or drywall — depending on material).
                </Step>
                <Step num={3} title="Thread standoff barrels">
                  Screw the barrel portion of each standoff into the wall anchor, leaving it slightly loose.
                </Step>
                <Step num={4} title="Mount the panel">
                  Align the sign holes over the barrel standoffs and screw the cap portion onto each barrel, sandwiching the panel. Tighten evenly so the sign sits flush.
                </Step>
              </div>
            </div>
          </Section>

          {/* Decals */}
          <Section title="Vinyl Decals & Window Graphics">
            <p className="text-gray-600 mb-5">Decals ship with transfer tape applied. Clean the surface thoroughly before installation.</p>
            <Step num={1} title="Clean the surface">
              Wipe with isopropyl alcohol (70%+) and a lint-free cloth. Remove all dust, oil, and residue. Allow to dry completely — at least 5 minutes.
            </Step>
            <Step num={2} title="Peel the backing">
              Peel the white paper backing away from the decal slowly and evenly. The decal will remain attached to the clear transfer tape.
            </Step>
            <Step num={3} title="Position and apply">
              Align the decal with your desired position. Start from the center and work outward using a squeegee or credit card to press the decal onto the surface, pushing out air bubbles.
            </Step>
            <Step num={4} title="Remove transfer tape">
              Slowly peel the clear transfer tape back at a low angle (roughly 30–45°). If the vinyl lifts with the tape, press it back down and wait 2 minutes before trying again.
            </Step>
            <Step num={5} title="Final smoothing">
              Use a squeegee to firmly press the entire decal surface, paying close attention to edges and corners.
            </Step>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900">Install in shade and temperatures between 50°F–90°F for best adhesion. Avoid cold surfaces — adhesive won't bond well below 50°F.</p>
              </div>
              <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">Wait 24–48 hours before washing a vehicle after applying vinyl graphics to allow the adhesive to cure fully.</p>
              </div>
            </div>
          </Section>

          {/* Trade Show */}
          <Section title="Trade Show Displays">
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              {[
                'Assemble display frames on a clean, padded surface to avoid scratching hardware.',
                'Fabric displays: stretch the graphic over the frame starting at the top, then work around evenly to avoid bunching.',
                'Retractable banners: store rolled tightly in the base after each use — do not fold.',
                'Pop-up frames: expand evenly from the center outward. Never force the mechanism.',
                'Label your carry bags with your name and contact info for trade show shipping and storage.',
                'After each show, inspect all hardware. Replace any bent or cracked connectors before the next event.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </Section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Need installation hardware?</h2>
            <p className="text-gray-600 mb-6">We offer grommets, poles, rope, stands, and mounting hardware with your order. Ask when requesting a quote.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/custom-quote" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Get a Quote</Link>
              <Link to="/contact" className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">Ask a Question</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
