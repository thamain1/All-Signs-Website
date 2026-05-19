import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Canvas,
  Textbox,
  Rect,
  Circle as FabricCircle,
  Triangle,
  Polygon,
  Image as FabricImage,
  Object as FabricObject,
  filters,
} from 'fabric';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Design, PreflightCheck, Product, Template } from '../types';
import {
  exportCanvasToImage,
  exportCanvasToPDF,
  runPreflightChecks,
  inchesToPixels,
  generateProofToken,
  CanvasDimensions,
} from '../lib/designStudio';
import {
  Loader2, Check, AlertTriangle, ShoppingCart,
  Type, Image as ImageIcon, Square, Circle as LucideCircle,
  Triangle as TriangleIcon, Star,
  Undo2, Redo2, Download, Trash2, Pencil, Copy as CopyIcon,
  ChevronsUp, ChevronsDown, ArrowUp, ArrowDown,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline,
  Eye, EyeOff, Lock, Unlock,
  FlipHorizontal, FlipVertical,
  Layers, Share2, Plus, Minus, Maximize2, X,
  MessageCircle, ThumbsUp, AlertCircle,
} from 'lucide-react';
import SizeSelector from '../components/SizeSelector';

const AVAILABLE_FONTS = [
  'Arial', 'Inter', 'Montserrat', 'Poppins', 'Oswald',
  'Roboto Slab', 'Bebas Neue', 'Times New Roman',
  'Courier New', 'Georgia', 'Verdana',
];

type SelState = {
  type: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  rx: number;
  brightness: number;
  contrast: number;
};

const DEFAULT_SEL: SelState = {
  type: '',
  fontFamily: 'Arial',
  fontSize: 36,
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  textAlign: 'left',
  fill: '#000000',
  stroke: '',
  strokeWidth: 0,
  opacity: 1,
  flipX: false,
  flipY: false,
  rx: 0,
  brightness: 0,
  contrast: 0,
};

function syncSelFromObj(obj: FabricObject): SelState {
  const o = obj as any;
  let brightness = 0;
  let contrast = 0;
  if (obj.type === 'image' && Array.isArray(o.filters)) {
    for (const f of o.filters) {
      if (f instanceof filters.Brightness) brightness = (f as any).brightness || 0;
      if (f instanceof filters.Contrast) contrast = (f as any).contrast || 0;
    }
  }
  return {
    type: obj.type || '',
    fontFamily: o.fontFamily || 'Arial',
    fontSize: o.fontSize || 36,
    fontWeight: o.fontWeight || 'normal',
    fontStyle: o.fontStyle || 'normal',
    underline: !!o.underline,
    textAlign: o.textAlign || 'left',
    fill: typeof o.fill === 'string' ? o.fill : '#000000',
    stroke: o.stroke || '',
    strokeWidth: o.strokeWidth || 0,
    opacity: typeof o.opacity === 'number' ? o.opacity : 1,
    flipX: !!o.flipX,
    flipY: !!o.flipY,
    rx: o.rx || 0,
    brightness,
    contrast,
  };
}

function starPoints(spikes = 5, outerR = 60, innerR = 28) {
  const points: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;
  for (let i = 0; i < 2 * spikes; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    points.push({ x: outerR + r * Math.cos(angle), y: outerR + r * Math.sin(angle) });
  }
  return points;
}

function getObjectLabel(obj: FabricObject): string {
  const o = obj as any;
  if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
    const text = (o.text || '').replace(/\s+/g, ' ').trim();
    return text.length > 22 ? text.slice(0, 22) + '…' : text || 'Text';
  }
  if (obj.type === 'image') return 'Image';
  if (obj.type === 'rect') return 'Rectangle';
  if (obj.type === 'circle') return 'Circle';
  if (obj.type === 'triangle') return 'Triangle';
  if (obj.type === 'polygon') return 'Star';
  return obj.type || 'Object';
}

function getObjectIcon(type: string) {
  switch (type) {
    case 'textbox': case 'i-text': case 'text': return Type;
    case 'image': return ImageIcon;
    case 'rect': return Square;
    case 'circle': return LucideCircle;
    case 'triangle': return TriangleIcon;
    case 'polygon': return Star;
    default: return Square;
  }
}

function computeImageDPI(obj: FabricObject): number | null {
  if (obj.type !== 'image') return null;
  const o = obj as any;
  const scaleX = obj.scaleX || 1;
  const scaleY = obj.scaleY || 1;
  if (!o.width || !o.height) return null;
  const dpiX = 150 / scaleX;
  const dpiY = 150 / scaleY;
  return Math.min(dpiX, dpiY);
}

export function DesignEditor() {
  const { designId } = useParams<{ designId: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ── State ──
  const [design, setDesign] = useState<Design | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [preflight, setPreflight] = useState<PreflightCheck | null>(null);
  const [showPreflight, setShowPreflight] = useState(false);
  const [preflightCartMode, setPreflightCartMode] = useState(false);
  const [selectedObj, setSelectedObj] = useState<FabricObject | null>(null);
  const [sel, setSel] = useState<SelState>(DEFAULT_SEL);
  const [autoScale, setAutoScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [designName, setDesignName] = useState('');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [layersVersion, setLayersVersion] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofCopied, setProofCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackProofs, setFeedbackProofs] = useState<Array<{ proof: any; comments: any[] }>>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productPickerPending, setProductPickerPending] = useState(false); // true if picker should chain into add-to-cart

  // ── Refs ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<Design | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const clipboardRef = useRef<FabricObject | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const effectiveScale = autoScale * userZoom;

  useEffect(() => {
    designRef.current = design;
    if (design && !designName) setDesignName(design.name);
  }, [design]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadDesign();
    loadTemplates();
    loadProducts();
  }, [designId, user]);

  useEffect(() => {
    if (canvasRef.current && design && !fabricRef.current) {
      initCanvas();
    }
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [design]);

  useEffect(() => {
    const onResize = () => recalcScale();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoHistory(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redoHistory(); return; }
      if (ctrl && e.key === 'c') { e.preventDefault(); copySelected(); return; }
      if (ctrl && e.key === 'v') { e.preventDefault(); pasteClipboard(); return; }
      if (ctrl && e.key === 'd') { e.preventDefault(); copySelected(); pasteClipboard(); return; }
      if (ctrl && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); return; }
      if (ctrl && e.key === '-') { e.preventDefault(); zoomOut(); return; }
      if (ctrl && e.key === '0') { e.preventDefault(); zoomFit(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && fabricRef.current?.getActiveObject()) {
        e.preventDefault(); deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!showDownloadMenu) return;
    const close = () => setShowDownloadMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showDownloadMenu]);

  // ── Data ──

  const loadDesign = async () => {
    const { data, error } = await supabase.from('designs').select('*').eq('id', designId).maybeSingle();
    if (error || !data) { navigate('/account/designs'); return; }
    setDesign(data);
    setDesignName(data.name);
    if (data.product_id) {
      const { data: prod } = await supabase.from('products').select('*').eq('id', data.product_id).maybeSingle();
      if (prod) setProduct(prod);
    }
    // Show template picker if the design is empty
    const ed = data.editor_json;
    const parsed = typeof ed === 'string' ? (() => { try { return JSON.parse(ed); } catch { return null; } })() : ed;
    if (!parsed?.objects?.length) {
      setShowTemplatePicker(true);
    }
    setLoading(false);
  };

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .eq('is_published', true)
      .order('usage_count', { ascending: false });
    setTemplates(data || []);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setAllProducts(data || []);
  };

  // Maps a free-text product_type ('banner') to a category slug ('banners')
  const productTypeToCategorySlug: Record<string, string> = {
    banner: 'banners',
    banners: 'banners',
    'yard-sign': 'yard-signs',
    'yard-signs': 'yard-signs',
    'rigid-sign': 'rigid-signs',
    'rigid-signs': 'rigid-signs',
    flag: 'flags',
    flags: 'flags',
    'feather-flag': 'flags',
    decal: 'decals-rectangle',
    decals: 'decals-rectangle',
    magnet: 'vehicle-graphics',
    magnets: 'vehicle-graphics',
    'vehicle-magnet': 'vehicle-graphics',
    'trade-show': 'trade-show',
  };

  // Pick a default product matching the design's product_type
  const inferProductForDesign = (d: Design): Product | null => {
    const target = productTypeToCategorySlug[d.product_type] || d.product_type;
    return allProducts.find(p => p.size_preset_category === target) || null;
  };

  const linkProductToDesign = async (productId: string) => {
    if (!designRef.current) return;
    const prod = allProducts.find(p => p.id === productId);
    if (!prod) return;
    const updated = { ...designRef.current, product_id: productId };
    setDesign(updated);
    designRef.current = updated;
    setProduct(prod);
    await supabase.from('designs').update({ product_id: productId, updated_at: new Date().toISOString() }).eq('id', updated.id);
  };

  const pickProduct = async (productId: string) => {
    await linkProductToDesign(productId);
    setShowProductPicker(false);
    if (productPickerPending) {
      setProductPickerPending(false);
      // Resume the add-to-cart flow now that we have a product
      handleAddToCart();
    }
  };

  // ── Canvas ──

  const getDimensions = (): CanvasDimensions | null => {
    const d = designRef.current;
    if (!d) return null;
    return { widthIn: d.width_in, heightIn: d.height_in, bleedIn: d.bleed_in, safeZoneIn: d.safe_zone_in };
  };

  const bumpLayers = () => setLayersVersion(v => v + 1);

  const recalcScale = () => {
    if (!containerRef.current || !designRef.current || !fabricRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const cw = containerRef.current.clientWidth - 64;
    const ch = containerRef.current.clientHeight - 64;
    const fit = Math.min(cw / wPx, ch / hPx, 1);
    setAutoScale(fit);
    const finalScale = fit * userZoom;
    fabricRef.current.setZoom(finalScale);
    fabricRef.current.setDimensions({ width: wPx * finalScale, height: hPx * finalScale });
    fabricRef.current.renderAll();
  };

  const applyZoom = (newUserZoom: number) => {
    if (!fabricRef.current || !designRef.current) return;
    setUserZoom(newUserZoom);
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const finalScale = autoScale * newUserZoom;
    fabricRef.current.setZoom(finalScale);
    fabricRef.current.setDimensions({ width: wPx * finalScale, height: hPx * finalScale });
    fabricRef.current.renderAll();
  };

  const zoomIn  = () => applyZoom(Math.min(userZoom * 1.25, 4));
  const zoomOut = () => applyZoom(Math.max(userZoom / 1.25, 0.25));
  const zoomFit = () => applyZoom(1);

  const initCanvas = async () => {
    if (!canvasRef.current || !design || !containerRef.current) return;
    await document.fonts.ready;

    const wPx = inchesToPixels(design.width_in, 150);
    const hPx = inchesToPixels(design.height_in, 150);
    const cw = containerRef.current.clientWidth - 64;
    const ch = containerRef.current.clientHeight - 64;
    const scale = Math.min(cw / wPx, ch / hPx, 1);
    setAutoScale(scale);

    const fc = new Canvas(canvasRef.current, {
      width: wPx * scale,
      height: hPx * scale,
      backgroundColor: '#ffffff',
    });
    fc.setZoom(scale);

    let editorData = design.editor_json;
    if (typeof editorData === 'string') {
      try { editorData = JSON.parse(editorData); } catch { editorData = null; }
    }
    if (editorData?.objects?.length) {
      await new Promise<void>(resolve => {
        fc.loadFromJSON(editorData, () => { fc.renderAll(); resolve(); });
      });
    }

    if (typeof fc.backgroundColor === 'string') setBgColor(fc.backgroundColor);

    historyRef.current = [JSON.stringify(fc.toJSON())];
    historyIdxRef.current = 0;

    fc.on('object:modified', onCanvasChange);
    fc.on('object:added', onCanvasChange);
    fc.on('object:removed', onCanvasChange);

    const updateSel = (obj?: FabricObject) => {
      setSelectedObj(obj || null);
      setSel(obj ? syncSelFromObj(obj) : DEFAULT_SEL);
    };
    fc.on('selection:created', e => updateSel(e.selected?.[0]));
    fc.on('selection:updated', e => updateSel(e.selected?.[0]));
    fc.on('selection:cleared', () => updateSel());

    fabricRef.current = fc;
    bumpLayers();
  };

  // ── History + Save ──

  const scheduleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveDesign, 3000);
  };

  const onCanvasChange = () => {
    if (isRestoringRef.current) return;
    pushHistory();
    scheduleSave();
    bumpLayers();
  };

  const pushHistory = () => {
    if (!fabricRef.current || isRestoringRef.current) return;
    const snap = JSON.stringify(fabricRef.current.toJSON());
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    }
    historyRef.current.push(snap);
    if (historyRef.current.length > 50) historyRef.current.shift();
    else historyIdxRef.current++;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
  };

  const restoreHistory = async (snap: string) => {
    if (!fabricRef.current) return;
    isRestoringRef.current = true;
    const data = JSON.parse(snap);
    await new Promise<void>(resolve => {
      fabricRef.current!.loadFromJSON(data, () => {
        fabricRef.current!.discardActiveObject();
        fabricRef.current!.renderAll();
        resolve();
      });
    });
    isRestoringRef.current = false;
    if (typeof fabricRef.current.backgroundColor === 'string') {
      setBgColor(fabricRef.current.backgroundColor);
    }
    setSelectedObj(null);
    setSel(DEFAULT_SEL);
    bumpLayers();
  };

  const undoHistory = async () => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    await restoreHistory(historyRef.current[historyIdxRef.current]);
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(true);
    scheduleSave();
  };

  const redoHistory = async () => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    await restoreHistory(historyRef.current[historyIdxRef.current]);
    setCanUndo(true);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
    scheduleSave();
  };

  const saveDesign = async () => {
    if (!fabricRef.current || !designRef.current) return;
    setSaving(true);
    try {
      const d = designRef.current;
      const wPx = inchesToPixels(d.width_in, 150);
      const hPx = inchesToPixels(d.height_in, 150);
      const prevZoom = fabricRef.current.getZoom();
      const prevW = fabricRef.current.width!;
      const prevH = fabricRef.current.height!;

      fabricRef.current.setZoom(1);
      fabricRef.current.setDimensions({ width: wPx, height: hPx });

      const editorJson = fabricRef.current.toJSON();
      const preview = await exportCanvasToImage(fabricRef.current, 0.5);

      fabricRef.current.setZoom(prevZoom);
      fabricRef.current.setDimensions({ width: prevW, height: prevH });
      fabricRef.current.renderAll();

      await supabase.from('designs').update({
        editor_json: editorJson,
        preview_png_url: preview,
        updated_at: new Date().toISOString(),
      }).eq('id', d.id);

      setLastSaved(new Date());
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Object manipulation ──

  const applyProp = (props: Record<string, unknown>) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || !fabricRef.current) return;
    obj.set(props as Parameters<typeof obj.set>[0]);
    fabricRef.current.renderAll();
    setSel(prev => ({ ...prev, ...props } as SelState));
    pushHistory();
    scheduleSave();
  };

  const addTextbox = () => {
    if (!fabricRef.current || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const tb = new Textbox('Your Text Here', {
      left: wPx * 0.1,
      top: hPx * 0.4,
      width: wPx * 0.8,
      fontSize: Math.max(24, Math.round(wPx * 0.05)),
      fill: '#000000',
      fontFamily: 'Arial',
      textAlign: 'left',
    });
    fabricRef.current.add(tb);
    fabricRef.current.setActiveObject(tb);
    fabricRef.current.renderAll();
  };

  const addRectangle = () => {
    if (!fabricRef.current || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    fabricRef.current.add(new Rect({
      left: wPx * 0.2, top: hPx * 0.2,
      width: wPx * 0.3, height: hPx * 0.2,
      fill: '#3B82F6', rx: 0, ry: 0,
    }));
    fabricRef.current.renderAll();
  };

  const addCircle = () => {
    if (!fabricRef.current || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    fabricRef.current.add(new FabricCircle({
      left: wPx * 0.2, top: hPx * 0.2,
      radius: Math.min(wPx, hPx) * 0.12,
      fill: '#10B981',
    }));
    fabricRef.current.renderAll();
  };

  const addTriangle = () => {
    if (!fabricRef.current || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const size = Math.min(wPx, hPx) * 0.2;
    fabricRef.current.add(new Triangle({
      left: wPx * 0.2, top: hPx * 0.2,
      width: size, height: size,
      fill: '#F59E0B',
    }));
    fabricRef.current.renderAll();
  };

  const addStar = () => {
    if (!fabricRef.current || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const r = Math.min(wPx, hPx) * 0.12;
    fabricRef.current.add(new Polygon(starPoints(5, r, r * 0.45), {
      left: wPx * 0.2, top: hPx * 0.2,
      fill: '#EAB308',
    }));
    fabricRef.current.renderAll();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current || !designRef.current) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      const d = designRef.current!;
      const wPx = inchesToPixels(d.width_in, 150);
      const hPx = inchesToPixels(d.height_in, 150);
      FabricImage.fromURL(url).then(img => {
        const scale = Math.min((wPx * 0.5) / (img.width || 1), (hPx * 0.5) / (img.height || 1));
        const scaledW = (img.width || 0) * scale;
        const scaledH = (img.height || 0) * scale;
        img.scale(scale);
        img.set({ left: (wPx - scaledW) / 2, top: (hPx - scaledH) / 2 });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
        fabricRef.current?.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteSelected = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || !fabricRef.current) return;
    fabricRef.current.remove(obj);
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setSelectedObj(null);
    setSel(DEFAULT_SEL);
    pushHistory();
    scheduleSave();
  };

  const copySelected = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj) return;
    obj.clone().then((c: FabricObject) => { clipboardRef.current = c; });
  };

  const pasteClipboard = () => {
    if (!clipboardRef.current || !fabricRef.current) return;
    clipboardRef.current.clone().then((c: FabricObject) => {
      c.set({ left: (c.left || 0) + 20, top: (c.top || 0) + 20 });
      fabricRef.current!.add(c);
      fabricRef.current!.setActiveObject(c);
      fabricRef.current!.renderAll();
      pushHistory();
      scheduleSave();
    });
  };

  const alignObject = (action: string) => {
    const obj = fabricRef.current?.getActiveObject();
    const fc = fabricRef.current;
    if (!obj || !fc || !designRef.current) return;
    const d = designRef.current;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const br = obj.getBoundingRect();
    switch (action) {
      case 'left':    obj.set({ left: (obj.left || 0) - br.left }); break;
      case 'centerH': obj.set({ left: (obj.left || 0) + (wPx / 2 - br.left - br.width / 2) }); break;
      case 'right':   obj.set({ left: (obj.left || 0) + (wPx - br.left - br.width) }); break;
      case 'top':     obj.set({ top: (obj.top || 0) - br.top }); break;
      case 'centerV': obj.set({ top: (obj.top || 0) + (hPx / 2 - br.top - br.height / 2) }); break;
      case 'bottom':  obj.set({ top: (obj.top || 0) + (hPx - br.top - br.height) }); break;
    }
    (obj as any).setCoords?.();
    fc.renderAll();
    pushHistory();
    scheduleSave();
  };

  const flipH = () => applyProp({ flipX: !sel.flipX });
  const flipV = () => applyProp({ flipY: !sel.flipY });

  const changeBgColor = (color: string) => {
    if (!fabricRef.current) return;
    setBgColor(color);
    (fabricRef.current as any).backgroundColor = color;
    fabricRef.current.renderAll();
    pushHistory();
    scheduleSave();
  };

  // ── Layers panel actions ──

  const selectLayer = (obj: FabricObject) => {
    if (!fabricRef.current) return;
    fabricRef.current.setActiveObject(obj);
    fabricRef.current.renderAll();
    setSelectedObj(obj);
    setSel(syncSelFromObj(obj));
  };

  const toggleVisibility = (obj: FabricObject) => {
    obj.set('visible', !obj.visible);
    fabricRef.current?.renderAll();
    pushHistory();
    scheduleSave();
    bumpLayers();
  };

  const toggleLock = (obj: FabricObject) => {
    const locked = obj.selectable === false;
    obj.set({ selectable: locked, evented: locked, lockMovementX: !locked, lockMovementY: !locked, lockScalingX: !locked, lockScalingY: !locked, lockRotation: !locked });
    if (!locked && fabricRef.current?.getActiveObject() === obj) {
      fabricRef.current.discardActiveObject();
    }
    fabricRef.current?.renderAll();
    pushHistory();
    scheduleSave();
    bumpLayers();
  };

  // ── Image filters ──

  const applyImageFilter = (kind: 'brightness' | 'contrast', value: number) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj || obj.type !== 'image' || !fabricRef.current) return;
    const img = obj as any;
    const list = (img.filters || []).filter((f: any) =>
      !(kind === 'brightness' && f instanceof filters.Brightness) &&
      !(kind === 'contrast' && f instanceof filters.Contrast)
    );
    if (value !== 0) {
      if (kind === 'brightness') list.push(new filters.Brightness({ brightness: value }));
      if (kind === 'contrast') list.push(new filters.Contrast({ contrast: value }));
    }
    img.filters = list;
    img.applyFilters();
    fabricRef.current.renderAll();
    setSel(prev => ({ ...prev, [kind]: value }));
    pushHistory();
    scheduleSave();
  };

  // ── Size + name ──

  const handleSizeChange = async (newW: number, newH: number) => {
    if (!design || !fabricRef.current || !containerRef.current) return;
    const updated = { ...design, width_in: newW, height_in: newH };
    setDesign(updated);
    designRef.current = updated;
    await supabase.from('designs').update({ width_in: newW, height_in: newH, updated_at: new Date().toISOString() }).eq('id', design.id);
    recalcScale();
  };

  const saveDesignName = async () => {
    if (!design || !designName.trim()) return;
    setEditingName(false);
    if (designName === design.name) return;
    const updated = { ...design, name: designName };
    setDesign(updated);
    designRef.current = updated;
    await supabase.from('designs').update({ name: designName }).eq('id', design.id);
  };

  // ── Export ──

  const withExportZoom = async <T,>(fn: (fc: Canvas) => Promise<T>): Promise<T> => {
    const fc = fabricRef.current!;
    const d = designRef.current!;
    const wPx = inchesToPixels(d.width_in, 150);
    const hPx = inchesToPixels(d.height_in, 150);
    const prevZoom = fc.getZoom();
    const prevW = fc.width!;
    const prevH = fc.height!;
    fc.setZoom(1);
    fc.setDimensions({ width: wPx, height: hPx });
    const result = await fn(fc);
    fc.setZoom(prevZoom);
    fc.setDimensions({ width: prevW, height: prevH });
    fc.renderAll();
    return result;
  };

  const downloadPNG = async () => {
    if (!fabricRef.current || !designRef.current) return;
    setShowDownloadMenu(false);
    const dataUrl = await withExportZoom(fc => exportCanvasToImage(fc, 2));
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${designRef.current.name || 'design'}.png`;
    a.click();
  };

  const downloadPDF = async () => {
    if (!fabricRef.current || !designRef.current) return;
    setShowDownloadMenu(false);
    const dims = getDimensions()!;
    const blob = await withExportZoom(fc => exportCanvasToPDF(fc, dims));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designRef.current.name || 'design'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Templates ──

  const applyTemplate = async (template: Template) => {
    if (!fabricRef.current) return;
    setShowTemplatePicker(false);
    isRestoringRef.current = true;
    let data = template.editor_json;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = null; }
    }
    if (data) {
      await new Promise<void>(resolve => {
        fabricRef.current!.loadFromJSON(data, () => {
          fabricRef.current!.renderAll();
          resolve();
        });
      });
      if (typeof fabricRef.current.backgroundColor === 'string') {
        setBgColor(fabricRef.current.backgroundColor);
      }
    }
    isRestoringRef.current = false;
    pushHistory();
    scheduleSave();
    bumpLayers();
    supabase.from('templates').update({ usage_count: template.usage_count + 1 }).eq('id', template.id);
  };

  // ── Proof share ──

  const generateProofLink = async () => {
    if (!designRef.current || !user) return;
    setProofLoading(true);
    try {
      await saveDesign();
      const token = generateProofToken();
      const { error } = await supabase.from('proof_links').insert({
        design_id: designRef.current.id,
        token,
        created_by: user.id,
        title: `${designRef.current.name} - Design Proof`,
      });
      if (error) { alert('Failed to create proof link'); return; }
      setProofUrl(`${window.location.origin}/proof/${token}`);
      setShowProofModal(true);
    } finally {
      setProofLoading(false);
    }
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try Clipboard API first
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall through to textarea fallback
    }
    // Fallback for older browsers / unfocused contexts
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const copyProofUrl = async () => {
    const ok = await copyToClipboard(proofUrl);
    if (ok) {
      setProofCopied(true);
      setTimeout(() => setProofCopied(false), 2000);
    } else {
      alert('Could not copy automatically — please select the URL and copy manually (Ctrl+C).');
    }
  };

  const loadFeedback = async () => {
    if (!designRef.current) return;
    setFeedbackLoading(true);
    setShowFeedback(true);
    try {
      const { data: proofs } = await supabase
        .from('proof_links')
        .select('*')
        .eq('design_id', designRef.current.id)
        .order('created_at', { ascending: false });
      if (!proofs || proofs.length === 0) { setFeedbackProofs([]); return; }
      const ids = proofs.map((p: any) => p.id);
      const { data: comments } = await supabase
        .from('proof_comments')
        .select('*')
        .in('proof_link_id', ids)
        .eq('is_internal', false)
        .order('created_at', { ascending: false });
      const byProof = (comments || []).reduce((acc: Record<string, any[]>, c: any) => {
        (acc[c.proof_link_id] = acc[c.proof_link_id] || []).push(c);
        return acc;
      }, {});
      setFeedbackProofs(proofs.map((p: any) => ({ proof: p, comments: byProof[p.id] || [] })));
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ── Preflight + cart ──

  const handleAddToCart = async () => {
    if (!design || !fabricRef.current) return;
    // If no product is linked yet, ask the user to pick one before continuing.
    if (!designRef.current?.product_id) {
      setProductPickerPending(true);
      setShowProductPicker(true);
      return;
    }
    const dims = getDimensions()!;
    const result = runPreflightChecks(fabricRef.current, dims);
    setPreflight(result);
    if (!result.passed) {
      setPreflightCartMode(false);
      setShowPreflight(true);
      return;
    }
    if (result.warnings.length > 0) {
      setPreflightCartMode(true);
      setShowPreflight(true);
      return;
    }
    await executeAddToCart();
  };

  const executeAddToCart = async () => {
    const d = designRef.current;
    if (!d?.product_id) {
      setProductPickerPending(true);
      setShowProductPicker(true);
      return;
    }
    setShowPreflight(false);
    await saveDesign();
    const v = d.variant_snapshot || {};
    await addToCart({
      product_id: d.product_id,
      quantity: v.quantity || 1,
      width: d.width_in,
      height: d.height_in,
      selected_options: v.selected_options || {},
      unit_price: v.unit_price || 50,
      total_price: (v.unit_price || 50) * (v.quantity || 1),
      production_speed: v.production_speed || 'standard',
    });
    navigate('/cart');
  };

  const runCheck = () => {
    const dims = getDimensions();
    if (!dims || !fabricRef.current) return;
    setPreflight(runPreflightChecks(fabricRef.current, dims));
    setPreflightCartMode(false);
    setShowPreflight(true);
  };

  // ── Derived ──

  const isText = selectedObj?.type === 'textbox' || selectedObj?.type === 'i-text' || selectedObj?.type === 'text';
  const isShape = selectedObj?.type === 'rect' || selectedObj?.type === 'circle' || selectedObj?.type === 'triangle' || selectedObj?.type === 'polygon' || selectedObj?.type === 'ellipse';
  const isRect = selectedObj?.type === 'rect';
  const isImage = selectedObj?.type === 'image';
  const safeZonePx = design ? design.safe_zone_in * 150 * effectiveScale : 0;
  const objects = fabricRef.current ? fabricRef.current.getObjects() : [];
  // referenced just to make React re-render the layers panel on bumpLayers()
  void layersVersion;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const imgDPI = isImage && selectedObj ? computeImageDPI(selectedObj) : null;
  const filteredTemplates = templates.filter(t => !design?.product_type || !t.product_type || t.product_type === design.product_type);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/account/designs')} className="text-gray-500 hover:text-gray-800 text-sm flex-shrink-0">
            ← Back
          </button>

          {editingName ? (
            <input
              ref={nameInputRef}
              value={designName}
              onChange={e => setDesignName(e.target.value)}
              onBlur={saveDesignName}
              onKeyDown={e => {
                if (e.key === 'Enter') saveDesignName();
                if (e.key === 'Escape') { setEditingName(false); setDesignName(design?.name || ''); }
              }}
              className="text-base font-bold text-gray-900 border-b-2 border-green-500 outline-none bg-transparent w-48"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setEditingName(true); setTimeout(() => nameInputRef.current?.select(), 30); }}
              className="flex items-center gap-1.5 text-base font-bold text-gray-900 hover:text-gray-700 group min-w-0"
            >
              <span className="truncate max-w-48">{design?.name}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-40 flex-shrink-0" />
            </button>
          )}

          {saving ? (
            <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
              <Check className="w-3 h-3 text-green-500" /> Saved
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={undoHistory} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={redoHistory} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={() => setShowSafeZone(v => !v)}
            title={showSafeZone ? 'Hide safe zone' : 'Show safe zone'}
            className={`p-2 rounded transition-colors ${showSafeZone ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            {showSafeZone ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowLayers(v => !v)}
            title={showLayers ? 'Hide layers' : 'Show layers'}
            className={`p-2 rounded transition-colors ${showLayers ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowTemplatePicker(true)}
            title="Templates"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            <Star className="w-4 h-4" />
            Templates
          </button>

          <button
            onClick={generateProofLink}
            disabled={proofLoading}
            title="Share proof for customer review"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
          >
            {proofLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Share Proof
          </button>

          <button
            onClick={loadFeedback}
            title="View customer feedback on shared proofs"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Feedback
          </button>

          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowDownloadMenu(v => !v); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
                <button onClick={downloadPNG} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">PNG (High-res)</button>
                <button onClick={downloadPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">PDF (Print-ready)</button>
              </div>
            )}
          </div>

          <button onClick={runCheck} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            <AlertTriangle className="w-4 h-4" />
            Check
          </button>

          <button onClick={handleAddToCart} className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">

          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Add Elements</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={addTextbox} className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 transition-colors">
                <Type className="w-4 h-4 text-gray-500" /> Text
              </button>
              <label className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 cursor-pointer transition-colors">
                <ImageIcon className="w-4 h-4 text-gray-500" /> Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button onClick={addRectangle} className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 transition-colors">
                <Square className="w-4 h-4 text-gray-500" /> Rect
              </button>
              <button onClick={addCircle} className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 transition-colors">
                <LucideCircle className="w-4 h-4 text-gray-500" /> Circle
              </button>
              <button onClick={addTriangle} className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 transition-colors">
                <TriangleIcon className="w-4 h-4 text-gray-500" /> Triangle
              </button>
              <button onClick={addStar} className="flex flex-col items-center gap-1 py-2.5 px-1 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-[11px] text-gray-700 transition-colors">
                <Star className="w-4 h-4 text-gray-500" /> Star
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Product</p>
            {product ? (
              <button
                onClick={() => setShowProductPicker(true)}
                className="w-full flex items-center justify-between gap-2 px-2 py-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-left"
                title="Change product"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{product.size_preset_category || 'custom'}</p>
                </div>
                <Pencil className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => setShowProductPicker(true)}
                className="w-full flex items-center justify-center gap-2 px-2 py-2 border border-dashed border-yellow-400 bg-yellow-50 rounded hover:bg-yellow-100 text-xs text-yellow-800 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Choose a product
              </button>
            )}
          </div>

          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Background</p>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => changeBgColor(e.target.value)} className="w-9 h-8 rounded cursor-pointer border border-gray-300 flex-shrink-0" />
              <input type="text" value={bgColor} onChange={e => changeBgColor(e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono" />
            </div>
          </div>

          {selectedObj && (
            <div className="p-3 border-b border-gray-100 space-y-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Properties</p>

              {/* Text properties */}
              {isText && (
                <>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Font Family</label>
                    <select
                      value={sel.fontFamily}
                      onChange={e => { const f = e.target.value; document.fonts.load(`16px "${f}"`).then(() => applyProp({ fontFamily: f })); }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-green-500"
                    >
                      {AVAILABLE_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-gray-600 mb-1 block">Size (pt)</label>
                      <input type="number" min={6} max={500} value={sel.fontSize} onChange={e => applyProp({ fontSize: parseInt(e.target.value) || 36 })} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-green-500" />
                    </div>
                    <div className="flex items-end gap-1 pb-0.5">
                      <button onClick={() => applyProp({ fontWeight: sel.fontWeight === 'bold' ? 'normal' : 'bold' })} title="Bold" className={`p-1.5 rounded border transition-colors ${sel.fontWeight === 'bold' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <Bold className="w-3 h-3" />
                      </button>
                      <button onClick={() => applyProp({ fontStyle: sel.fontStyle === 'italic' ? 'normal' : 'italic' })} title="Italic" className={`p-1.5 rounded border transition-colors ${sel.fontStyle === 'italic' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <Italic className="w-3 h-3" />
                      </button>
                      <button onClick={() => applyProp({ underline: !sel.underline })} title="Underline" className={`p-1.5 rounded border transition-colors ${sel.underline ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <Underline className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Text alignment within text box */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Text Alignment</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { v: 'left', I: AlignLeft },
                        { v: 'center', I: AlignCenter },
                        { v: 'right', I: AlignRight },
                        { v: 'justify', I: AlignJustify },
                      ].map(({ v, I }) => (
                        <button
                          key={v}
                          onClick={() => applyProp({ textAlign: v })}
                          title={v}
                          className={`p-1.5 rounded border transition-colors ${sel.textAlign === v ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <I className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Text Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={sel.fill || '#000000'} onChange={e => applyProp({ fill: e.target.value })} className="w-9 h-8 rounded cursor-pointer border border-gray-300 flex-shrink-0" />
                      <input type="text" value={sel.fill} onChange={e => applyProp({ fill: e.target.value })} className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono" />
                    </div>
                  </div>
                </>
              )}

              {/* Shape properties */}
              {isShape && (
                <>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fill Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={sel.fill || '#3B82F6'} onChange={e => applyProp({ fill: e.target.value })} className="w-9 h-8 rounded cursor-pointer border border-gray-300 flex-shrink-0" />
                      <input type="text" value={sel.fill} onChange={e => applyProp({ fill: e.target.value })} className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Stroke — <span className="font-normal">width</span>
                      <input type="number" min={0} max={30} value={sel.strokeWidth} onChange={e => applyProp({ strokeWidth: parseInt(e.target.value) || 0 })} className="ml-1 w-12 px-1.5 py-0.5 border border-gray-200 rounded text-xs inline-block" />px
                    </label>
                    <div className="flex gap-2">
                      <input type="color" value={sel.stroke || '#000000'} onChange={e => applyProp({ stroke: e.target.value, strokeWidth: sel.strokeWidth || 2 })} className="w-9 h-8 rounded cursor-pointer border border-gray-300 flex-shrink-0" />
                      <input type="text" value={sel.stroke} onChange={e => applyProp({ stroke: e.target.value })} className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded text-xs font-mono" />
                    </div>
                  </div>
                  {isRect && (
                    <div>
                      <label className="text-xs text-gray-600 mb-1 flex justify-between">
                        <span>Corner Radius</span>
                        <span className="font-mono">{sel.rx}px</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={1}
                        value={sel.rx}
                        onChange={e => { const r = parseInt(e.target.value); applyProp({ rx: r, ry: r }); }}
                        className="w-full accent-green-600"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Image filters */}
              {isImage && (
                <>
                  {imgDPI !== null && (
                    <div className={`p-2 rounded text-[11px] ${imgDPI < 100 ? 'bg-red-50 text-red-700' : imgDPI < 150 ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                      Effective DPI: <strong>{Math.round(imgDPI)}</strong>
                      {imgDPI < 100 ? ' — too low' : imgDPI < 150 ? ' — low' : ' — good'}
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 flex justify-between">
                      <span>Brightness</span>
                      <span className="font-mono">{Math.round(sel.brightness * 100)}</span>
                    </label>
                    <input type="range" min={-0.5} max={0.5} step={0.01} value={sel.brightness} onChange={e => applyImageFilter('brightness', parseFloat(e.target.value))} className="w-full accent-green-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 flex justify-between">
                      <span>Contrast</span>
                      <span className="font-mono">{Math.round(sel.contrast * 100)}</span>
                    </label>
                    <input type="range" min={-0.5} max={0.5} step={0.01} value={sel.contrast} onChange={e => applyImageFilter('contrast', parseFloat(e.target.value))} className="w-full accent-green-600" />
                  </div>
                </>
              )}

              {/* Opacity + flip — all types */}
              <div>
                <label className="text-xs text-gray-600 mb-1 flex justify-between">
                  <span>Opacity</span>
                  <span className="font-mono">{Math.round(sel.opacity * 100)}%</span>
                </label>
                <input type="range" min={0} max={1} step={0.01} value={sel.opacity} onChange={e => applyProp({ opacity: parseFloat(e.target.value) })} className="w-full accent-green-600" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={flipH}
                  title="Flip Horizontal"
                  className={`flex-1 flex items-center justify-center gap-1 p-2 border rounded text-xs transition-colors ${sel.flipX ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                </button>
                <button
                  onClick={flipV}
                  title="Flip Vertical"
                  className={`flex-1 flex items-center justify-center gap-1 p-2 border rounded text-xs transition-colors ${sel.flipY ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <FlipVertical className="w-3.5 h-3.5" /> Flip V
                </button>
              </div>
            </div>
          )}

          {selectedObj && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Align on Canvas</p>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => alignObject('left')} title="Align Left" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <AlignLeft className="w-3.5 h-3.5 mx-auto text-gray-600" />
                </button>
                <button onClick={() => alignObject('centerH')} title="Center Horizontal" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <AlignCenter className="w-3.5 h-3.5 mx-auto text-gray-600" />
                </button>
                <button onClick={() => alignObject('right')} title="Align Right" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <AlignRight className="w-3.5 h-3.5 mx-auto text-gray-600" />
                </button>
                <button onClick={() => alignObject('top')} title="Align Top" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <span className="block text-center text-[10px] text-gray-600 font-medium">Top</span>
                </button>
                <button onClick={() => alignObject('centerV')} title="Center Vertical" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <span className="block text-center text-[10px] text-gray-600 font-medium">Mid</span>
                </button>
                <button onClick={() => alignObject('bottom')} title="Align Bottom" className="p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                  <span className="block text-center text-[10px] text-gray-600 font-medium">Bot</span>
                </button>
              </div>
            </div>
          )}

          {selectedObj && (
            <div className="p-3 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Layers</p>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <button onClick={() => { fabricRef.current?.bringObjectToFront(selectedObj); fabricRef.current?.renderAll(); pushHistory(); scheduleSave(); bumpLayers(); }} className="flex items-center justify-center gap-1 p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition-colors">
                  <ChevronsUp className="w-3.5 h-3.5" /> Front
                </button>
                <button onClick={() => { fabricRef.current?.sendObjectToBack(selectedObj); fabricRef.current?.renderAll(); pushHistory(); scheduleSave(); bumpLayers(); }} className="flex items-center justify-center gap-1 p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition-colors">
                  <ChevronsDown className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => { fabricRef.current?.bringObjectForward(selectedObj); fabricRef.current?.renderAll(); pushHistory(); scheduleSave(); bumpLayers(); }} className="flex items-center justify-center gap-1 p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition-colors">
                  <ArrowUp className="w-3.5 h-3.5" /> Fwd
                </button>
                <button onClick={() => { fabricRef.current?.sendObjectBackwards(selectedObj); fabricRef.current?.renderAll(); pushHistory(); scheduleSave(); bumpLayers(); }} className="flex items-center justify-center gap-1 p-2 border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition-colors">
                  <ArrowDown className="w-3.5 h-3.5" /> Bwd
                </button>
              </div>
              <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-xs transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete (Del)
              </button>
            </div>
          )}

          <div className="p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Print Size</p>
            {product?.size_preset_category ? (
              <SizeSelector
                categorySlug={product.size_preset_category}
                selectedWidth={design?.width_in}
                selectedHeight={design?.height_in}
                onSizeChange={handleSizeChange}
                allowCustomSize
                showLegibilityGuide={false}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">W (in)</label>
                  <input type="number" step="0.1" min="0.1" value={design?.width_in || ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0 && design) handleSizeChange(v, design.height_in); }} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">H (in)</label>
                  <input type="number" step="0.1" min="0.1" value={design?.height_in || ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0 && design) handleSizeChange(design.width_in, v); }} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-green-500" />
                </div>
              </div>
            )}
            <p className="mt-2 text-[10px] text-gray-400">
              Bleed: {design?.bleed_in}" · Safe zone: {design?.safe_zone_in}"
            </p>
          </div>
        </div>

        {/* ── Canvas area ── */}
        <div ref={containerRef} className="flex-1 p-8 flex items-center justify-center overflow-auto relative bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="relative" style={{ display: 'inline-block' }}>
              <canvas ref={canvasRef} className="block" />
              {showSafeZone && design && safeZonePx > 0 && (
                <div className="absolute inset-0 pointer-events-none select-none">
                  <div className="absolute border-2 border-dashed border-blue-400/50 rounded-sm" style={{ inset: `${safeZonePx}px` }} />
                  <span className="absolute text-[9px] leading-3 text-blue-400/70 bg-white/70 px-0.5 rounded" style={{ top: safeZonePx + 3, left: safeZonePx + 3 }}>
                    Safe Zone
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-md flex items-center divide-x divide-gray-200">
            <button onClick={zoomOut} title="Zoom out (Ctrl+-)" className="p-2 hover:bg-gray-50 text-gray-700">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={zoomFit} title="Fit to screen (Ctrl+0)" className="px-3 py-2 hover:bg-gray-50 text-xs font-medium text-gray-700 min-w-[64px]">
              {Math.round(userZoom * 100)}%
            </button>
            <button onClick={zoomIn} title="Zoom in (Ctrl++)" className="p-2 hover:bg-gray-50 text-gray-700">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={zoomFit} title="Reset zoom" className="p-2 hover:bg-gray-50 text-gray-700">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-white/80 px-3 py-1 rounded-full shadow-sm pointer-events-none whitespace-nowrap">
            Click to select · Double-click text to edit · Ctrl+Z undo · Ctrl+C/V copy · Ctrl+/- zoom
          </div>
        </div>

        {/* ── Layers panel (right) ── */}
        {showLayers && (
          <div className="w-56 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Layers</p>
              <button onClick={() => setShowLayers(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {objects.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No layers yet.<br />Add elements to start.</p>
              ) : (
                [...objects].reverse().map((obj, idx) => {
                  const Icon = getObjectIcon(obj.type || '');
                  const isSelected = obj === selectedObj;
                  const isHidden = obj.visible === false;
                  const isLocked = obj.selectable === false;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectLayer(obj)}
                      className={`group flex items-center gap-1 px-2 py-1.5 rounded text-xs cursor-pointer border transition-colors ${isSelected ? 'bg-green-50 border-green-300' : 'border-transparent hover:bg-gray-50'}`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                      <span className={`flex-1 truncate ${isHidden ? 'line-through opacity-50' : ''}`}>
                        {getObjectLabel(obj)}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); toggleVisibility(obj); }}
                        title={isHidden ? 'Show' : 'Hide'}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                      >
                        {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); toggleLock(obj); }}
                        title={isLocked ? 'Unlock' : 'Lock'}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-3 py-2 border-t border-gray-100 text-[10px] text-gray-400">
              {objects.length} {objects.length === 1 ? 'layer' : 'layers'}
            </div>
          </div>
        )}
      </div>

      {/* ── Preflight modal ── */}
      {showPreflight && preflight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {preflight.passed && preflight.warnings.length === 0
                ? '✓ Design Check Passed'
                : preflight.blockers.length > 0
                ? '✗ Issues Found'
                : '⚠ Warnings'}
            </h2>

            {preflight.blockers.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-800 text-sm mb-2">Must fix before printing:</p>
                <ul className="space-y-1">{preflight.blockers.map((m, i) => <li key={i} className="text-sm text-red-700">• {m}</li>)}</ul>
              </div>
            )}

            {preflight.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-semibold text-yellow-800 text-sm mb-2">Warnings:</p>
                <ul className="space-y-1">{preflight.warnings.map((m, i) => <li key={i} className="text-sm text-yellow-700">• {m}</li>)}</ul>
              </div>
            )}

            {preflight.passed && preflight.warnings.length === 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">Your design looks great and is print-ready!</p>
              </div>
            )}

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <strong>Color note:</strong> Your design is shown in RGB on screen. Final print uses CMYK,
              so very bright/saturated colors (especially neon greens, bright blues, oranges)
              may print slightly less vivid than they appear here. This is normal.
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowPreflight(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                {preflight.blockers.length > 0 ? 'Fix Issues' : 'Back to Editing'}
              </button>
              {preflightCartMode && preflight.blockers.length === 0 && (
                <button onClick={executeAddToCart} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm transition-colors">
                  Add to Cart Anyway
                </button>
              )}
              {!preflightCartMode && preflight.passed && (
                <button onClick={executeAddToCart} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors">
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Template picker modal ── */}
      {showTemplatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Start with a Template</h2>
                <p className="text-sm text-gray-500 mt-1">Pick a professional starter or begin from blank.</p>
              </div>
              <button onClick={() => setShowTemplatePicker(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center min-h-[180px] group"
              >
                <Plus className="w-10 h-10 text-gray-400 group-hover:text-green-600 mb-2" />
                <p className="font-semibold text-gray-900">Start Blank</p>
                <p className="text-xs text-gray-500 mt-1">Empty canvas</p>
              </button>

              {filteredTemplates.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-gray-500">
                  No templates available yet — start blank and build from scratch.
                </div>
              )}

              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-32 flex items-center justify-center overflow-hidden">
                    {t.thumbnail_url ? (
                      <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400 px-2 text-center">{t.name}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 truncate">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Product picker modal ── */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose a Product</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {productPickerPending
                    ? 'Pick the product this design will be printed on, then we\'ll add it to your cart.'
                    : 'Pick the product this design will be printed on.'}
                </p>
              </div>
              <button onClick={() => { setShowProductPicker(false); setProductPickerPending(false); }} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {allProducts.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">No products available.</p>
            ) : (
              <>
                {design && inferProductForDesign(design) && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                    Suggested based on your design type: <strong>{inferProductForDesign(design)!.name}</strong>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProducts.map(p => {
                    const isCurrent = design?.product_id === p.id;
                    const isSuggested = design && inferProductForDesign(design)?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => pickProduct(p.id)}
                        className={`text-left p-3 rounded-lg border-2 transition-colors ${
                          isCurrent
                            ? 'border-green-500 bg-green-50'
                            : isSuggested
                            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {p.size_preset_category?.replace(/-/g, ' ') || 'custom'}
                          {isCurrent && ' · current'}
                          {!isCurrent && isSuggested && ' · suggested'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Proof share modal ── */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Share Proof Link</h2>
              <button onClick={() => setShowProofModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Send this link to your customer (or yourself) for review and approval. The recipient can comment, request changes, or approve the design — no account required.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={proofUrl}
                readOnly
                onFocus={e => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-200 rounded text-xs font-mono bg-gray-50"
              />
              <button
                onClick={copyProofUrl}
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-colors text-white ${proofCopied ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {proofCopied ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {proofCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Proof saves the current design state. To send an updated version, generate a new link after making changes.
            </p>
          </div>
        </div>
      )}

      {/* ── Customer feedback modal ── */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customer Feedback</h2>
                <p className="text-sm text-gray-500 mt-1">All proofs sent for this design and their reviews.</p>
              </div>
              <button onClick={() => setShowFeedback(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : feedbackProofs.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <Share2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                No proofs shared yet. Click <strong>Share Proof</strong> to send a review link to a customer.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackProofs.map(({ proof, comments }) => {
                  const proofLinkUrl = `${window.location.origin}/proof/${proof.token}`;
                  return (
                    <div key={proof.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              Sent {new Date(proof.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {proof.view_count} {proof.view_count === 1 ? 'view' : 'views'}
                              {proof.last_viewed_at && ` · last viewed ${new Date(proof.last_viewed_at).toLocaleDateString()}`}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(proofLinkUrl)}
                            title="Copy proof URL"
                            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 bg-white rounded hover:bg-gray-50 flex-shrink-0"
                          >
                            <CopyIcon className="w-3 h-3" /> Link
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        {comments.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2 text-center">No comments yet</p>
                        ) : (
                          <ul className="space-y-3">
                            {comments.map((c: any) => (
                              <li key={c.id} className="flex gap-2">
                                <div className="flex-shrink-0 mt-0.5">
                                  {c.status === 'approved' && <ThumbsUp className="w-4 h-4 text-green-600" />}
                                  {c.status === 'change_requested' && <AlertCircle className="w-4 h-4 text-orange-500" />}
                                  {c.status === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-gray-900">
                                      {c.author_name || 'Anonymous'}
                                    </span>
                                    <span className={`text-[10px] uppercase font-semibold tracking-wide rounded px-1.5 py-0.5 ${
                                      c.status === 'approved' ? 'bg-green-100 text-green-700' :
                                      c.status === 'change_requested' ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {c.status === 'change_requested' ? 'changes' : c.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(c.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{c.comment}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
