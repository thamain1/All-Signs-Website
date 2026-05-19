import { Link } from 'react-router-dom';
import { Ruler, CheckCircle, AlertCircle } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

export function DesignTips() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/resources" className="text-green-600 hover:text-green-700 text-sm font-medium">← Back to Resources</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Ruler className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Design Tips</h1>
            <p className="text-gray-600 mt-1">Create signage that gets noticed and drives results</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">

          <Section title="The 3-Second Rule">
            <p className="text-gray-600 mb-4">
              Most people driving or walking past a sign have 3 seconds or less to absorb your message. Effective sign design follows one rule: <strong>one message, instantly readable.</strong>
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { num: '1', label: 'One Big Message', desc: 'What is the single most important thing you want them to know?' },
                { num: '2', label: 'Supporting Detail', desc: 'One supporting line — phone number, URL, or tagline.' },
                { num: '3', label: 'Call to Action', desc: 'What should they do next? Call, visit, scan, stop in.' },
              ].map(({ num, label, desc }) => (
                <div key={num} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-2">{num}</div>
                  <div className="font-semibold text-gray-900 mb-1">{label}</div>
                  <div className="text-xs text-gray-600">{desc}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Font Selection & Sizing">
            <div className="space-y-4 mb-4">
              <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">Use clean, bold sans-serif fonts</div>
                  <p className="text-sm text-gray-700">Helvetica, Arial, Futura, Gotham, and similar fonts are highly legible at a distance. Bold weights outperform light or thin weights for outdoor visibility.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">Avoid decorative or script fonts for key text</div>
                  <p className="text-sm text-gray-700">Ornate scripts, thin display fonts, and all-caps stylized fonts reduce legibility — especially from a moving vehicle or at a glance.</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tl-lg">Viewing Distance</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Min. Letter Height</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tr-lg">Common Use</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['10 feet', '1 inch', 'Counter cards, window signs'],
                    ['25 feet', '2.5 inches', 'Yard signs, A-frames'],
                    ['50 feet', '5 inches', 'Storefront banners'],
                    ['100 feet', '10 inches', 'Large outdoor banners'],
                    ['500 feet', '50 inches', 'Highway billboards'],
                  ].map(([dist, height, use], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{dist}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">{height}</td>
                      <td className="px-4 py-3 text-gray-600">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Color & Contrast">
            <p className="text-gray-600 mb-4">High contrast between text and background is the single biggest factor in legibility. These color combinations have the highest visibility:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { bg: 'bg-black', text: 'text-yellow-400', bgLabel: 'Black', textLabel: 'Yellow', rank: '#1' },
                { bg: 'bg-black', text: 'text-white', bgLabel: 'Black', textLabel: 'White', rank: '#2' },
                { bg: 'bg-white border border-gray-200', text: 'text-black', bgLabel: 'White', textLabel: 'Black', rank: '#3' },
                { bg: 'bg-yellow-400', text: 'text-black', bgLabel: 'Yellow', textLabel: 'Black', rank: '#4' },
              ].map(({ bg, text, bgLabel, textLabel, rank }) => (
                <div key={rank} className={`${bg} rounded-lg p-4 text-center`}>
                  <div className={`${text} text-lg font-bold`}>{rank}</div>
                  <div className={`${text} text-xs mt-1`}>{bgLabel} / {textLabel}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              {[
                'Limit your palette to 2–3 colors maximum. More colors compete for attention.',
                'Avoid light text on light backgrounds or dark text on dark backgrounds — even subtle similarities kill readability.',
                'Use color purposefully: your CTA (phone number, URL) should be the highest-contrast element.',
                'Red and green next to each other are difficult for colorblind viewers — roughly 8% of men.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Layout & White Space">
            <div className="grid sm:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Do This</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    'Leave generous margins — at least 10% of the sign width on each side',
                    'Group related information visually using proximity',
                    'Use size hierarchy: most important text is largest',
                    'Align elements to a grid or center axis',
                    'Let your key message breathe — surround it with empty space',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Avoid This</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    'Filling every inch with text or graphics — clutter reduces readability',
                    'Using more than 2–3 different font families',
                    'Placing important text in corners where it gets lost',
                    'Stretching or distorting logos and images',
                    'Using low-quality or watermarked stock photos',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Images & Logos">
            <div className="space-y-3 text-sm text-gray-700">
              {[
                'Always use vector versions of your logo (.AI or .EPS) — they scale to any size without pixelation.',
                'Product photos should be at least 300 DPI at the size they will appear on the sign.',
                'Avoid pulling images from the web — website images are 72 DPI and will print blurry.',
                'If your logo has a white background, remove it before placing on a colored sign (use PNG with transparent background).',
                'Keep important image content away from edges — it may be trimmed or obscured by mounting hardware.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Effective Calls to Action">
            <p className="text-gray-600 mb-4">Your sign should tell people exactly what to do next. Here's what works:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Phone Number', tip: 'Large, bold, and easy to read. Include area code. Put it where the eye lands last.' },
                { label: 'Website / QR Code', tip: 'Short URLs work best. Pair with a QR code for pedestrians with smartphones.' },
                { label: 'Address', tip: 'Only include if location is your CTA. "Corner of Main & 5th" is better than a full street address.' },
                { label: 'Social Media', tip: 'Only if social is your goal. One platform handle is better than listing four.' },
              ].map(({ label, tip }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">{label}</div>
                  <div className="text-sm text-gray-600">{tip}</div>
                </div>
              ))}
            </div>
          </Section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Want us to design it for you?</h2>
            <p className="text-gray-600 mb-6">Our team offers professional design services and includes a free proof review with every order.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/custom-quote" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Request Design Help</Link>
              <Link to="/templates" className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">Browse Templates</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
