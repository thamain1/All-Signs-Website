import { Link } from 'react-router-dom';
import { Image, CheckCircle, Sun, CloudRain, Wind } from 'lucide-react';

interface MaterialCardProps {
  name: string;
  thickness?: string;
  bestFor: string[];
  outdoor: boolean;
  durability: string;
  notes: string;
}

function MaterialCard({ name, thickness, bestFor, outdoor, durability, notes }: MaterialCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{name}{thickness && <span className="text-sm text-gray-500 font-normal ml-2">{thickness}</span>}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${outdoor ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
          {outdoor ? '☀ Outdoor' : '⌂ Indoor'}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-3 font-medium">Durability: <span className="text-gray-800">{durability}</span></div>
      <p className="text-sm text-gray-600 mb-4">{notes}</p>
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Best For</div>
        <div className="flex flex-wrap gap-1">
          {bestFor.map(b => (
            <span key={b} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Materials() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/resources" className="text-green-600 hover:text-green-700 text-sm font-medium">← Back to Resources</Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Image className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Material Guide</h1>
            <p className="text-gray-600 mt-1">Choose the right substrate for your sign or display</p>
          </div>
        </div>

        {/* Quick picker */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Picker — What's your situation?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Sun, label: 'Long-term outdoor', rec: 'Aluminum, Coroplast, or 18oz Vinyl Banner', color: 'text-yellow-600 bg-yellow-50' },
              { icon: Wind, label: 'Trade show / event', rec: 'Fabric Display, Retractable Banner, or Pop-up', color: 'text-blue-600 bg-blue-50' },
              { icon: CloudRain, label: 'Temporary outdoor', rec: '13oz Vinyl Banner, Coroplast Yard Sign', color: 'text-green-600 bg-green-50' },
            ].map(({ icon: Icon, label, rec, color }) => (
              <div key={label} className="p-4 rounded-lg border border-gray-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{label}</div>
                <div className="text-xs text-gray-600">{rec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Banners */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vinyl Banners</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <MaterialCard
            name="Standard Vinyl Banner"
            thickness="13 oz"
            outdoor={true}
            durability="1–2 years outdoors"
            bestFor={['Grand openings', 'Sidewalk promotions', 'Event backdrops', 'Temporary storefront']}
            notes="The most popular banner material. Lightweight, affordable, and prints with vivid colors. Includes reinforced hems and grommets every 2 feet."
          />
          <MaterialCard
            name="Mesh Vinyl Banner"
            thickness="9 oz perforated"
            outdoor={true}
            durability="1–2 years outdoors"
            bestFor={['Fence signs', 'High-wind locations', 'Construction sites', 'Sports fields']}
            notes="Perforated mesh allows wind to pass through, reducing stress on grommets and supports. Ideal for any location where wind load is a concern."
          />
          <MaterialCard
            name="Heavy-Duty Vinyl Banner"
            thickness="18 oz"
            outdoor={true}
            durability="3–5 years outdoors"
            bestFor={['Permanent building signage', 'Long-term outdoor use', 'High-traffic areas']}
            notes="Thicker and more durable than standard vinyl. Resists tearing, UV fading, and harsh weather. Best choice when you need a banner to last multiple seasons."
          />
          <MaterialCard
            name="Fabric Banner"
            thickness="Polyester"
            outdoor={false}
            durability="5+ years indoors"
            bestFor={['Trade shows', 'Retail displays', 'Photo backdrops', 'Stage decor']}
            notes="Wrinkle-resistant polyester with a premium matte finish. Prints with rich, photographic quality. Lightweight and easily folded for transport."
          />
        </div>

        {/* Rigid Signs */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rigid Signs</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <MaterialCard
            name="Coroplast (Corrugated Plastic)"
            thickness="4mm"
            outdoor={true}
            durability="6–12 months outdoors"
            bestFor={['Yard signs', 'Real estate signs', 'Election signs', 'Directional signs']}
            notes="Lightweight corrugated plastic board. Accepts wire H-stakes for ground mounting. Economical and widely used for short-to-medium term outdoor signage."
          />
          <MaterialCard
            name="Aluminum Composite (ACM)"
            thickness="3mm / 6mm"
            outdoor={true}
            durability="7–10 years outdoors"
            bestFor={['Business signs', 'Building directories', 'Outdoor nameplates', 'Menu boards']}
            notes="Aluminum composite material with a polyethylene core. Rigid, lightweight, and weather-resistant. Will not rust or corrode. Perfect for professional permanent signage."
          />
          <MaterialCard
            name="PVC Foam Board"
            thickness="3mm / 6mm"
            outdoor={false}
            durability="5+ years indoors"
            bestFor={['Indoor signage', 'Point-of-sale displays', 'Lobby signs', 'Trade show panels']}
            notes="Smooth white foam PVC board. Easy to mount with standoffs or adhesive. Gives a polished, professional look for indoor environments."
          />
          <MaterialCard
            name="Dibond® Aluminum"
            thickness="3mm"
            outdoor={true}
            durability="10+ years"
            bestFor={['Premium outdoor signage', 'Architectural signs', 'Long-term building ID']}
            notes="Premium aluminum with a mineral-filled core. Extremely flat, rigid, and weather-resistant. The gold standard for permanent outdoor business signage."
          />
        </div>

        {/* Specialty */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Specialty Materials</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <MaterialCard
            name="Cast Vinyl Decal"
            outdoor={true}
            durability="5–7 years outdoors"
            bestFor={['Vehicle graphics', 'Window lettering', 'Equipment labels', 'Fleet branding']}
            notes="Premium calendered or cast vinyl film. Conforms to curved surfaces. UV and weather-resistant. Available in matte, gloss, and specialty finishes."
          />
          <MaterialCard
            name="Magnetic Sheet"
            outdoor={true}
            durability="2–3 years with care"
            bestFor={['Vehicle door signs', 'Removable promotions', 'Temporary branding']}
            notes="Flexible magnetic sheet that adheres to steel vehicle doors without damage. Easy to apply and remove. Store flat when not in use to prevent warping."
          />
          <MaterialCard
            name="Window Perf (One-Way Vision)"
            outdoor={true}
            durability="3–5 years"
            bestFor={['Storefront windows', 'Vehicle rear windows', 'Privacy glass']}
            notes="Perforated vinyl film that prints full-color graphics on the outside while allowing visibility from inside. 60/40 perforation ratio is standard."
          />
          <MaterialCard
            name="Retractable Banner Stand"
            outdoor={false}
            durability="Reusable hardware"
            bestFor={['Trade shows', 'Lobby displays', 'Point-of-sale', 'Presentations']}
            notes="Polypropylene or polyester graphic rolls up into a base for transport. Lightweight and portable. Graphic is replaceable when your message changes."
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not sure what to choose?</h2>
          <p className="text-gray-700 mb-4">Our team can recommend the right material based on your location, budget, and how long you need your sign to last.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/custom-quote" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Get a Custom Quote</Link>
            <Link to="/contact" className="bg-white text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
