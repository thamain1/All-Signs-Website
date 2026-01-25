import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Template, TemplateCategory } from '../types';
import { Loader2, Plus } from 'lucide-react';

export function TemplateLibrary() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const productType = searchParams.get('product_type') || 'banner';
  const width = parseFloat(searchParams.get('width') || '48');
  const height = parseFloat(searchParams.get('height') || '24');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTemplates();
  }, [productType, user]);

  const loadTemplates = async () => {
    const { data: categoriesData } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    const { data: templatesData } = await supabase
      .from('templates')
      .select('*')
      .eq('is_published', true)
      .order('usage_count', { ascending: false });

    setCategories(categoriesData || []);
    setTemplates(templatesData || []);
    setLoading(false);
  };

  const createDesignFromTemplate = async (template: Template | null) => {
    if (!user) return;

    const designData = {
      user_id: user.id,
      name: template ? `${template.name} Copy` : 'New Design',
      template_id: template?.id || null,
      product_type: productType,
      variant_snapshot: {
        product_type: productType,
        width,
        height,
      },
      width_in: width,
      height_in: height,
      bleed_in: 0.125,
      safe_zone_in: 0.25,
      editor_json: template?.editor_json || {
        version: '5.3.0',
        objects: [],
        background: '#ffffff'
      },
      status: 'draft',
    };

    const { data, error } = await supabase
      .from('designs')
      .insert(designData)
      .select()
      .single();

    if (error) {
      console.error('Error creating design:', error);
      alert('Failed to create design');
      return;
    }

    if (template) {
      await supabase
        .from('templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);
    }

    navigate(`/designs/${data.id}/edit`);
  };

  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category_id === selectedCategory)
    : templates;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Template</h1>
          <p className="text-gray-600">
            Start with a professional template or create from scratch
          </p>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Templates
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => createDesignFromTemplate(null)}
            className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-green-600 hover:bg-green-50 transition flex flex-col items-center justify-center min-h-[300px] group"
          >
            <Plus className="w-16 h-16 text-gray-400 group-hover:text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start from Blank</h3>
            <p className="text-gray-600 text-center">Create your design from scratch</p>
          </button>

          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => createDesignFromTemplate(template)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition text-left"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">{template.name}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
