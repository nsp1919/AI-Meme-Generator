"use client";

import { useState, useRef, useEffect } from "react";
import Draggable from 'react-draggable';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Download, Sparkles, Image as ImageIcon,
    Lightbulb, RefreshCw, Upload, Link as LinkIcon,
    Plus, Type, Square, Cloud, Trash2, Move, Settings
} from "lucide-react";
import { toPng } from 'html-to-image';
import { cn } from "@/lib/utils";

// Types
interface Layer {
    id: string;
    type: 'text' | 'shape';
    content: string;
    x: number;
    y: number;
    rotation: number;
    style: {
        fontSize: number;
        color: string;
        backgroundColor: string;
        fontWeight: string;
        padding: number;
        borderRadius: number;
    };
}

interface MemeSuggestion {
    topText: string;
    bottomText: string;
    visualPrompt: string;
}

export function MemeGenerator() {
    // --- State: Background ---
    const [bgType, setBgType] = useState<'ai' | 'upload' | 'url'>('ai');
    const [bgContent, setBgContent] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [urlInput, setUrlInput] = useState("");

    // --- State: Standard Text (V2 Style) ---
    const [topText, setTopText] = useState("");
    const [bottomText, setBottomText] = useState("");
    const [showStandardSettings, setShowStandardSettings] = useState(false);
    const [standardStyle, setStandardStyle] = useState({
        top: { fontSize: 40, color: '#ffffff', stroke: '#000000' },
        bottom: { fontSize: 40, color: '#ffffff', stroke: '#000000' }
    });

    // --- State: Extra Layers (V3 Style) ---
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

    // --- UI State ---
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<MemeSuggestion[]>([]);
    const memeRef = useRef<HTMLDivElement>(null);

    // --- Actions ---

    // 1. Extra Layers Logic
    const addLayer = (type: 'text' | 'shape', content: string = "New Text") => {
        const newLayer: Layer = {
            id: Date.now().toString(),
            type,
            content,
            x: 150,
            y: 150,
            rotation: 0,
            style: {
                fontSize: type === 'text' ? 24 : 0,
                color: '#ffffff',
                backgroundColor: type === 'shape' ? '#ffffff' : 'transparent',
                fontWeight: '900',
                padding: 8,
                borderRadius: type === 'shape' && content === 'cloud' ? 50 : 4
            }
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    const updateLayer = (id: string, updates: Partial<Layer> | Partial<Layer['style']>) => {
        setLayers(layers.map(l => {
            if (l.id !== id) return l;
            if ('fontSize' in updates || 'color' in updates || 'backgroundColor' in updates) {
                return { ...l, style: { ...l.style, ...updates } };
            }
            return { ...l, ...updates };
        }));
    };

    const deleteLayer = (id: string) => {
        setLayers(layers.filter(l => l.id !== id));
        setSelectedLayerId(null);
    };

    // 2. Background Logic
    const handleGenerateAI = async () => {
        if (!aiPrompt) return;
        setIsLoading(true);
        const encodedPrompt = encodeURIComponent(aiPrompt);
        const seed = Math.floor(Math.random() * 1000000);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
        setBgContent(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setBgContent(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput) setBgContent(urlInput);
    };

    // 3. Gemini Logic
    const fetchSuggestions = async () => {
        setIsSuggesting(true);
        try {
            const res = await fetch("/api/gemini/suggest", { method: "POST" });
            const data = await res.json();
            if (data.suggestions) setSuggestions(data.suggestions);
        } catch (e) { console.error(e); }
        finally { setIsSuggesting(false); }
    };

    const applySuggestion = (s: MemeSuggestion) => {
        setAiPrompt(s.visualPrompt);
        setBgType('ai');
        setTopText(s.topText);
        setBottomText(s.bottomText);
        // Clear extra layers to avoid clutter
        setLayers([]);
        // Optional: Trigger AI generation automatically
        // handleGenerateAI(); 
    };

    // 4. Download
    const handleDownload = async () => {
        if (memeRef.current === null) return;
        try {
            const dataUrl = await toPng(memeRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `meme-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error(err); }
    };

    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full p-4">
            <div className="grid gap-8 lg:grid-cols-[450px_1fr]">

                {/* --- LEFT PANEL: CONTROLS --- */}
                <div className="flex flex-col gap-6 order-2 lg:order-1 h-full max-h-[calc(100vh-100px)] overflow-y-auto pr-2">

                    {/* Image Source Tabs */}
                    <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="ai"><Sparkles className="w-4 h-4 mr-2" /> AI</TabsTrigger>
                            <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-2" /> Upload</TabsTrigger>
                            <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-2" /> URL</TabsTrigger>
                        </TabsList>

                        <Card className="mt-4 border-dashed">
                            <CardContent className="pt-6">
                                {bgType === 'ai' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label>Prompt</Label>
                                            <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={isSuggesting}>
                                                {isSuggesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-4 h-4 text-yellow-500" />}
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Describe image..." className="h-24"
                                        />
                                        <Button onClick={handleGenerateAI} disabled={isLoading || !aiPrompt} className="w-full">
                                            {isLoading ? "Generating..." : "Generate Background"}
                                        </Button>
                                        {suggestions.length > 0 && (
                                            <div className="h-40 overflow-y-auto border rounded p-2 text-xs space-y-2">
                                                {suggestions.map((s, i) => (
                                                    <div key={i} onClick={() => applySuggestion(s)} className="p-2 hover:bg-muted cursor-pointer rounded">
                                                        <div className="font-bold">{s.topText}</div>
                                                        <div className="truncate opacity-70">{s.visualPrompt}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {bgType === 'upload' && (
                                    <div className="space-y-4">
                                        <Label>Upload Image</Label>
                                        <Input type="file" onChange={handleFileUpload} accept="image/*" />
                                    </div>
                                )}
                                {bgType === 'url' && (
                                    <div className="space-y-4">
                                        <Label>Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." />
                                            <Button onClick={handleUrlSubmit}>Set</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Tabs>

                    {/* Standard Text Controls */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-semibold text-muted-foreground">Standard Text (Auto-Centered)</Label>
                            <Button variant="ghost" size="icon" onClick={() => setShowStandardSettings(!showStandardSettings)}>
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <Label>Top Text</Label>
                            <Input value={topText} onChange={(e) => setTopText(e.target.value.toUpperCase())} placeholder="TOP TEXT" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Bottom Text</Label>
                            <Input value={bottomText} onChange={(e) => setBottomText(e.target.value.toUpperCase())} placeholder="BOTTOM TEXT" />
                        </div>

                        {showStandardSettings && (
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Text Size</Label>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setStandardStyle(s => ({ ...s, top: { ...s.top, fontSize: s.top.fontSize - 2 }, bottom: { ...s.bottom, fontSize: s.bottom.fontSize - 2 } }))}>-</Button>
                                            <span className="text-sm py-2">Both: {standardStyle.top.fontSize}px</span>
                                            <Button size="sm" variant="outline" onClick={() => setStandardStyle(s => ({ ...s, top: { ...s.top, fontSize: s.top.fontSize + 2 }, bottom: { ...s.bottom, fontSize: s.bottom.fontSize + 2 } }))}>+</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Text Color</Label>
                                        <div className="flex gap-2">
                                            {['#ffffff', '#000000', '#ff0000', '#ffff00'].map(c => (
                                                <button key={c} className="w-6 h-6 rounded-full border" style={{ background: c }}
                                                    onClick={() => setStandardStyle(s => ({ ...s, top: { ...s.top, color: c }, bottom: { ...s.bottom, color: c } }))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Button variant="secondary" onClick={() => addLayer('text', 'Extra Text')} className="w-full">
                            <Plus className="w-4 h-4 mr-2" /> Add Extra Floating Text
                        </Button>
                        <Button variant="outline" onClick={() => addLayer('shape', 'cloud')} className="w-full">
                            <Cloud className="w-4 h-4 mr-2" /> Add Speech Bubble
                        </Button>
                    </div>

                    {/* EXTRA LAYER SETTINGS (Moved from Right Panel) */}
                    {selectedLayer && (
                        <Card className="border-2 border-blue-500 animate-in fade-in slide-in-from-left-4">
                            <CardHeader className="py-3 bg-muted/50">
                                <CardTitle className="text-sm flex justify-between items-center">
                                    Edit Selection
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedLayerId(null)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Input value={selectedLayer.content} onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Size</Label>
                                        <div className="flex gap-1">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => updateLayer(selectedLayer.id, { fontSize: selectedLayer.style.fontSize - 2 })}>-</Button>
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => updateLayer(selectedLayer.id, { fontSize: selectedLayer.style.fontSize + 2 })}>+</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color</Label>
                                        <div className="flex gap-1 justify-end">
                                            {['#ffffff', '#000000', '#ff0000', '#ffff00'].map(c => (
                                                <button key={c} className={`w-6 h-6 rounded-full border ${selectedLayer.style.color === c ? 'ring-2 ring-blue-500' : ''}`}
                                                    style={{ background: c }} onClick={() => updateLayer(selectedLayer.id, { color: c })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button variant="destructive" size="sm" className="w-full" onClick={() => deleteLayer(selectedLayer.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Layer
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* --- MIDDLE PANEL: CANVAS --- */}
                <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
                    <Card className="overflow-hidden shadow-2xl border-2 border-muted">
                        <div
                            ref={memeRef}
                            className="relative bg-zinc-900 overflow-hidden select-none"
                            style={{ width: '500px', height: '500px' }}
                            onMouseDown={() => setSelectedLayerId(null)}
                        >
                            {/* 1. Background Image */}
                            {bgContent ? (
                                <img src={bgContent} alt="Background" className="w-full h-full object-contain pointer-events-none" crossOrigin="anonymous" onLoad={() => setIsLoading(false)} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 opacity-20" />
                                </div>
                            )}

                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <RefreshCw className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}

                            {/* 2. Standard Top Text (Absolute V2 Style) */}
                            {topText && (
                                <h2 className="absolute top-4 left-0 right-0 text-center uppercase leading-none pointer-events-none z-10 break-words px-4"
                                    style={{
                                        fontFamily: 'Impact, sans-serif',
                                        fontSize: `${standardStyle.top.fontSize}px`,
                                        color: standardStyle.top.color,
                                        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'
                                    }}
                                >
                                    {topText}
                                </h2>
                            )}

                            {/* 3. Standard Bottom Text (Absolute V2 Style) */}
                            {bottomText && (
                                <h2 className="absolute bottom-4 left-0 right-0 text-center uppercase leading-none pointer-events-none z-10 break-words px-4"
                                    style={{
                                        fontFamily: 'Impact, sans-serif',
                                        fontSize: `${standardStyle.bottom.fontSize}px`,
                                        color: standardStyle.bottom.color,
                                        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000'
                                    }}
                                >
                                    {bottomText}
                                </h2>
                            )}

                            {/* 4. Extra Draggable Layers (V3 Style) */}
                            {layers.map((layer) => (
                                <DraggableLayer
                                    key={layer.id} layer={layer}
                                    isSelected={selectedLayerId === layer.id}
                                    onStop={(x, y) => updateLayer(layer.id, { x, y })}
                                    onSelect={() => setSelectedLayerId(layer.id)}
                                />
                            ))}
                        </div>
                    </Card>
                    <Button size="lg" className="w-full max-w-[500px]" onClick={handleDownload} disabled={!bgContent}>
                        <Download className="w-4 h-4 mr-2" /> Download Meme
                    </Button>
                </div>
            </div>
        </div>
    );
}

function DraggableLayer({ layer, isSelected, onStop, onSelect }: { layer: Layer, isSelected: boolean, onStop: (x: number, y: number) => void, onSelect: () => void }) {
    const nodeRef = useRef(null);
    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: layer.x, y: layer.y }}
            onStop={(e: any, data: any) => onStop(data.x, data.y)}
        >
            <div
                ref={nodeRef}
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`absolute cursor-move group ${isSelected ? 'ring-2 ring-blue-500' : ''} z-20`}
                style={{ transform: `rotate(${layer.rotation}deg)` }}
            >
                {layer.type === 'text' ? (
                    <h2
                        className="uppercase leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                        style={{
                            fontSize: `${layer.style.fontSize}px`,
                            color: layer.style.color,
                            background: layer.style.backgroundColor,
                            padding: `${layer.style.padding}px`,
                            borderRadius: `${layer.style.borderRadius}px`,
                            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
                            fontFamily: 'Impact, sans-serif'
                        }}
                    >
                        {layer.content}
                    </h2>
                ) : (
                    <div
                        style={{
                            width: '100px', height: '100px',
                            background: layer.style.backgroundColor,
                            borderRadius: layer.style.borderRadius ? '50%' : '0'
                        }}
                    />
                )}
            </div>
        </Draggable>
    );
}
