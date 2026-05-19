import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const Tip = ({ type = 'info', children }: { type?: 'info' | 'warn' | 'good'; children: React.ReactNode }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warn: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    good: 'bg-green-50 border-green-200 text-green-900',
  };
  const Icon = type === 'good' ? CheckCircle : type === 'warn' ? AlertCircle : Info;
  const iconColor = type === 'good' ? 'text-green-600' : type === 'warn' ? 'text-yellow-600' : 'text-blue-600';
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${styles[type]} mb-4`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-sm">{children}</p>
    </div>
  );
};

export function FileSetup() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/resources" className="text-green-600 hover:text-green-700 text-sm font-medium">← Back to Resources</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">File Setup Guide</h1>
            <p className="text-gray-600 mt-1">Everything you need to prepare print-ready artwork</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm">

          <Section title="Accepted File Formats">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[
                { format: 'PDF', note: 'Preferred — embed fonts, flatten transparencies', best: true },
                { format: 'AI (Adobe Illustrator)', note: 'Vector source, ideal for logos and graphics', best: true },
                { format: 'EPS', note: 'Vector format, widely compatible', best: true },
                { format: 'PSD (Photoshop)', note: 'Acceptable — flatten layers before sending', best: false },
                { format: 'PNG', note: 'High-res only — minimum 300 DPI at final print size', best: false },
                { format: 'JPG / JPEG', note: 'High-res only — avoid heavy compression', best: false },
              ].map(f => (
                <div key={f.format} className={`flex items-start gap-3 p-3 rounded-lg border ${f.best ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${f.best ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{f.format} {f.best && <span className="text-green-600 text-xs font-medium ml-1">Recommended</span>}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{f.note}</div>
                  </div>
                </div>
              ))}
            </div>
            <Tip type="warn">We do not accept Microsoft Word (.doc/.docx), PowerPoint (.ppt), or Publisher files. These formats do not translate well to print and will require conversion.</Tip>
          </Section>

          <Section title="Resolution Requirements">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tl-lg">Product Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">Minimum DPI</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900 rounded-tr-lg">Ideal DPI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Banners & Large Format', '100 DPI', '150 DPI at final size'],
                    ['Yard Signs & Rigid Signs', '150 DPI', '200 DPI at final size'],
                    ['Decals & Window Graphics', '150 DPI', '300 DPI at final size'],
                    ['Trade Show Displays', '100 DPI', '150 DPI at final size'],
                    ['Business Cards / Small Prints', '300 DPI', '300–600 DPI'],
                  ].map(([product, min, ideal], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{product}</td>
                      <td className="px-4 py-3 text-gray-600">{min}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{ideal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Tip type="info" >DPI (dots per inch) must be measured <strong>at your intended print size</strong>. A 72 DPI image scaled down from 10 ft to 3 ft does not become 300 DPI — always set your document size to the final print dimensions before designing.</Tip>
          </Section>

          <Section title="Bleed & Safe Zone">
            <p className="text-gray-600 mb-4">Bleed prevents white edges if the cutter shifts slightly. The safe zone ensures important content isn't trimmed.</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Bleed', value: '0.125" – 0.25"', desc: 'Extend background art beyond the trim line on all sides' },
                { label: 'Trim Line', value: 'Final size', desc: 'The exact dimensions your finished product will be cut to' },
                { label: 'Safe Zone', value: '0.25" inside trim', desc: 'Keep all text, logos, and important elements inside this boundary' },
              ].map(z => (
                <div key={z.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{z.label}</div>
                  <div className="text-lg font-bold text-gray-900 mb-1">{z.value}</div>
                  <div className="text-xs text-gray-600">{z.desc}</div>
                </div>
              ))}
            </div>
            <Tip type="good">Most sign products require 0.125" bleed on each side. Banners with hemmed edges need 0.5" extra on hemmed sides for folding.</Tip>
          </Section>

          <Section title="Color Mode">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <div className="font-bold text-gray-900 mb-1">CMYK <span className="text-green-600 text-sm font-medium">— Use This</span></div>
                <p className="text-sm text-gray-700">The standard for commercial printing. Convert your file to CMYK before submitting to ensure accurate color output.</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <div className="font-bold text-gray-900 mb-1">RGB <span className="text-gray-500 text-sm font-medium">— Screen Only</span></div>
                <p className="text-sm text-gray-600">Used for digital screens. We'll convert RGB files to CMYK, but colors may shift — especially bright blues, greens, and purples.</p>
              </div>
            </div>
            <Tip type="warn">Vibrant neon colors (especially electric blue, hot pink, and lime green) cannot be fully reproduced in CMYK print. Design your artwork in CMYK from the start to see accurate previews of your printed output.</Tip>
          </Section>

          <Section title="Fonts & Text">
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                'Embed or outline all fonts before saving your final file — missing fonts will cause text to reflow or default to a substitute.',
                'Minimum recommended text size is 8pt for small signs; for banners viewed from 10+ feet, use at least 2" tall letters.',
                'Avoid using light-weight fonts (thin/ultra-light) at small sizes — they disappear when printed.',
                'Ensure sufficient contrast between text and background. Black text on white, or white text on dark backgrounds, always prints cleanly.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
            <p className="text-gray-600 mb-6">Our team reviews every file before printing. If we spot any issues with resolution, bleed, or color, we'll reach out before running your job.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products/banners" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Browse Products</Link>
              <Link to="/contact" className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">Ask a Question</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
