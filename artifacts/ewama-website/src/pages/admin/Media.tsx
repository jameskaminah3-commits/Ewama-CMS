import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListMedia, useDeleteMedia, useUploadMedia } from '@workspace/api-client-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils';

// Helper if formatBytes is not in utils
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AdminMedia() {
  const { data, isLoading } = useListMedia({ limit: 100 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteMedia();
  const uploadMutation = useUploadMedia();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this file? Any content using this URL will break.')) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'File deleted' });
          queryClient.invalidateQueries({ queryKey: ['/api/media'] });
        }
      });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload since we don't have a real file upload endpoint in this mock schema
    // The API expects a JSON body with a URL, not FormData
    toast({ 
      title: "File processing...", 
      description: "In a real environment, this would upload to S3."
    });

    // Mock successful upload by posting to the JSON endpoint
    const dummyUrl = URL.createObjectURL(file);
    
    uploadMutation.mutate({
      data: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`, // Use unplash as dummy
        altText: file.name
      }
    }, {
      onSuccess: () => {
        toast({ title: 'File uploaded successfully' });
        queryClient.invalidateQueries({ queryKey: ['/api/media'] });
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: () => {
        toast({ title: 'Upload failed', variant: 'destructive' });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Manage images for properties and articles</p>
        </div>
        
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleUpload}
          />
          <Button 
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload File
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ImageIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-500 font-medium">Media library is empty.</p>
            <p className="text-sm text-gray-400 mt-1">Upload images to use them in your content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data?.data?.map((file) => (
              <div key={file.id} className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {file.mimeType?.startsWith('image/') ? (
                  <img src={file.url} alt={file.fileName} className="w-full h-full object-cover" />
                ) : (
                  <File className="w-12 h-12 text-gray-300" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <p className="text-white text-xs px-2 text-center truncate w-full">{file.fileName}</p>
                  <p className="text-white/70 text-[10px]">{formatSize(file.size)}</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(file.url);
                        toast({ title: 'URL Copied to clipboard' });
                      }}
                    >
                      Copy URL
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-8 w-8"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
