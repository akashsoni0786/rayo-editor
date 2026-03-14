// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Search, Link as LinkIcon, Loader2, ImageIcon, Grid, 
  Plus, X, ChevronLeft, ChevronRight, AlertCircle, 
  Check, Download, Image as LucideImage
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { api } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

// --- Types ---

export interface ProjectImage {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  url: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ImagesResponse {
  status: string;
  data: {
    images: ProjectImage[];
    pagination: {
      pages: number;
      page: number;
    };
  };
}

export interface InsertOptions {
  width: number | 'auto';
  height: number | 'auto';
  alignment: 'left' | 'center' | 'right';
  caption: string;
  altText: string;
}

export interface ImageGalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect?: (image: ProjectImage, options: InsertOptions) => void;
  projectId: string;
  editor?: Editor | null;
}

// --- Helper Components ---

const ImageCard = ({ 
  image, 
  isSelected, 
  onClick,
  onDownload 
}: { 
  image: ProjectImage; 
  isSelected: boolean; 
  onClick: () => void;
  onDownload: (e: React.MouseEvent) => void;
}) => (
  <motion.div
    layoutId={`image-${image.id}`}
    whileHover={{ y: -4 }}
    className={`
      group relative aspect-[4/3] rounded-xl border cursor-pointer overflow-hidden transition-all duration-200
      ${isSelected 
        ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-lg' 
        : 'border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md bg-white'
      }
    `}
    onClick={onClick}
  >
    {/* Image Background */}
    <div className="absolute inset-0 bg-gray-50">
      <img 
        src={image.url} 
        alt={image.original_filename}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    
    {/* Overlay Gradient */}
    <div className={`
      absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200
      ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}
    `}>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="truncate text-xs font-medium text-white">
          {image.original_filename}
        </p>
        <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-gray-300 uppercase">{image.mime_type?.split('/')[1] || 'IMG'}</span>
        </div>
      </div>
      
      {/* Download Action */}
      <button
        onClick={onDownload}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors"
      >
        <Download className="h-3 w-3" />
      </button>
    </div>

    {/* Selection Check */}
    {isSelected && (
      <div className="absolute top-2 left-2 z-10 rounded-full bg-blue-600 p-1 text-white shadow-sm">
        <Check className="h-3 w-3" />
      </div>
    )}
  </motion.div>
);

// --- Main Component ---

export default function ImageGalleryDialog({
  isOpen,
  onClose,
  onImageSelect,
  projectId,
  editor
}: ImageGalleryDialogProps) {
  // Core State
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // View State
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<{message: string; errors: string[]} | null>(null);
  const [uploadData, setUploadData] = useState<{
    file: File | null;
    url: string;
  }>({
    file: null,
    url: '',
  });

  // Insert Options
  const [insertOptions, setInsertOptions] = useState<InsertOptions>({
    width: 'auto',
    height: 'auto',
    alignment: 'center',
    caption: '',
    altText: ''
  });

  // --- Fetching Logic ---

  const fetchImages = useCallback(async (page = 1, search = '') => {
    if (!projectId) return;
    setLoading(true);
    try {
      let endpoint = `/api/v1/projects/${projectId}/images`;
      const params = new URLSearchParams();
      
      if (search) {
        endpoint += '/search';
        params.append('q', search);
      }
      params.append('page', page.toString());
      params.append('limit', '20');
      
      const response = await api.get<ImagesResponse>(`${endpoint}?${params.toString()}`);
      
      if (response.data.status === 'success') {
        setImages(response.data.data.images || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
        setCurrentPage(response.data.data.pagination?.page || 1);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchImages();
      setSelectedImage(null);
      setSearchQuery('');
      setCurrentPage(1);
      setActiveTab('gallery');
    }
  }, [isOpen, projectId, fetchImages]);

  // --- Upload Logic ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const performUpload = async () => {
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      const isUrlUpload = !uploadData.file && !!uploadData.url;
      
      formData.append('category', 'upload');

      if (isUrlUpload) {
        formData.append('image_url', uploadData.url);
      } else if (uploadData.file) {
        formData.append('file', uploadData.file);
      } else {
        return;
      }

      const response = await api.post(
        `/api/v1/projects/${projectId}/images/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.status === 'success') {
        setUploadSuccess(true);
        await fetchImages(); // Refresh gallery
        
        // Success animation delay
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadData({ file: null, url: '' });
          setActiveTab('gallery');
          setSelectedImage(response.data.data);
        }, 1500);
      }
    } catch (err: any) {
      setUploadError({
        message: err.response?.data?.message || 'Upload failed',
        errors: err.response?.data?.errors || []
      });
    } finally {
      setUploading(false);
    }
  };

  // --- Insert Logic ---

  const handleInsert = () => {
    const currentImage = selectedImage;
    if (!currentImage) return;
    
    const finalOptions = {
      ...insertOptions,
      altText: insertOptions.altText || currentImage.original_filename // Fallback alt text
    };

    if (onImageSelect) {
      onImageSelect(currentImage, finalOptions);
    } else if (editor) {
      const attrs: any = {
        src: currentImage.url,
        alt: finalOptions.altText,
        title: currentImage.original_filename,
        'data-image-id': currentImage.id,
        dataAlign: finalOptions.alignment // Pass alignment directly to the node attribute
      };
      
      if (finalOptions.width !== 'auto') attrs.width = finalOptions.width;
      if (finalOptions.height !== 'auto') attrs.height = finalOptions.height;
      
      editor.chain().focus().setImage(attrs).run();
      
      if (finalOptions.caption) {
        editor.chain().focus()
          .insertContentAt(editor.state.selection.to + 1, {
            type: 'paragraph',
            content: [{ type: 'text', text: finalOptions.caption, marks: [{ type: 'italic' }] }]
          }).run();
      }
    }

    onClose();
  };

  // --- Render ---

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#FDFDFD] rounded-2xl shadow-2xl border-0 ring-1 ring-black/5">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">Media Library</DialogTitle>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100/80 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'gallery'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            
            {/* Spacer for Default Close Button */}
            <div className="w-8 h-8" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Active Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              
              {activeTab === 'gallery' ? (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full"
                >
                  {/* Toolbar */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm z-10">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchImages(1, searchQuery)}
                        placeholder="Search assets..."
                        className="pl-9 w-full bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    {loading ? (
                      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="aspect-[4/3] bg-gray-200/50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : images.length > 0 ? (
                      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                        {images.map((img) => (
                          <ImageCard
                            key={img.id}
                            image={img}
                            isSelected={selectedImage?.id === img.id}
                            onClick={() => {
                              setSelectedImage(img);
                              setInsertOptions(prev => ({
                                ...prev,
                                width: '100%', // Default to 100% for better editor experience
                                height: 'auto',
                                altText: img.original_filename
                              }));
                            }}
                            onDownload={(e: any) => {
                              e.stopPropagation();
                              window.open(img.url, '_blank');
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <LucideImage className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-gray-500">No images found</p>
                        <p className="text-sm">Try adjusting your filters or upload new items</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar (Pagination + Actions) */}
                  <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-4">
                    
                    {/* Pagination - Left */}
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" size="sm" 
                          disabled={currentPage <= 1}
                          onClick={() => fetchImages(currentPage - 1, searchQuery)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </Button>
                        <Button 
                          variant="outline" size="sm"
                          disabled={currentPage >= totalPages}
                          onClick={() => fetchImages(currentPage + 1, searchQuery)}
                        >
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                    </div>

                    {/* Selection Actions - Right */}
                    <AnimatePresence>
                      {selectedImage && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="flex items-center gap-3"
                        >
                          {/* Insert Button */}
                          <Button 
                            onClick={handleInsert}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all gap-2"
                          >
                            Insert Image <Check className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col items-center justify-center p-8 h-full"
                >
                  <div className="w-full max-w-xl">
                    {uploadSuccess ? (
                      <div className="p-12 flex flex-col items-center text-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Complete!</h3>
                        <p className="text-gray-500">Your image is ready to use.</p>
                      </div>
                    ) : (
                      <div className="p-8">
                        <div 
                          className={`
                            border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center
                            ${isDragOver ? 'border-blue-500 bg-blue-50/20' : 'border-gray-300 hover:border-gray-400'}
                          `}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            if (e.dataTransfer.files?.[0]) setUploadData(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
                          }}
                        >
                          <div className="mb-4 p-3 bg-gray-100 rounded-full">
                            <Upload className="w-6 h-6 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {uploadData.file ? uploadData.file.name : "Click to upload or drag and drop"}
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            SVG, PNG, JPG or GIF (max. 10MB)
                          </p>
                          
                          {!uploadData.file && (
                            <div className="relative">
                              <Input 
                                type="file" 
                                className="hidden" 
                                id="file-upload"
                                accept="image/*"
                                onChange={handleFileSelect}
                              />
                              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                                Select File
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Input
                                placeholder="Paste image URL..."
                                value={uploadData.url}
                                onChange={(e) => setUploadData(prev => ({ ...prev, url: e.target.value }))}
                                disabled={!!uploadData.file}
                                className="bg-white"
                              />
                            </div>
                          </div>

                          {uploadError && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{uploadError.message}</p>
                                {uploadError.errors.map((e, i) => <p key={i} className="text-xs mt-1 opacity-80">• {e}</p>)}
                              </div>
                            </div>
                          )}

                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                            size="lg"
                            disabled={(!uploadData.file && !uploadData.url) || uploading}
                            onClick={performUpload}
                          >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}