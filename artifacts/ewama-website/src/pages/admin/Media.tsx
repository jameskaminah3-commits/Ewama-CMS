import { AdminLayout } from '@/components/admin/AdminLayout';
import { useListMedia, useDeleteMedia, useUploadMediaFile, getListMediaQueryKey } from '@workspace/api-client-react';
import { useState, useRef, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // Keep in sync with the API limit

export default function AdminMedia() {
  const { data, isLoading } = useListMedia({ limit: 100 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteMedia();
  const uploadMutation = useUploadMediaFile();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this file? Any content using this URL will break.')) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: 'File deleted' });
          queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
        }
      });
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const tooBig = list.filter(f => f.size > MAX_UPLOAD_BYTES);
    if (tooBig.length > 0) {
      toast({
        title: 'File too large',
        description: `${tooBig.map(f => f.name).join(', ')} exceeds the 10 MB limit.`,
        variant: 'destructive',
      });
    }

    const uploadable = list.filter(f => f.size <= MAX_UPLOAD_BYTES);
    setUploadingCount(uploadable.length);
    let uploaded = 0;
    let failed = 0;

    for (const file of uploadable) {
      try {
        await uploadMutation.mutateAsync({ data: { file, altText: file.name } });
        uploaded++;
      } catch {
        failed++;
      }
      setUploadingCount(c => Math.max(0, c - 1));
    }

    queryClient.invalidateQueries({ queryKey: getListMediaQueryKey() });
    if (uploaded > 0) {
      toast({ title: uploaded === 1 ? 'File uploaded' : `${uploaded} files uploaded` });
    }
    if (failed > 0) {
      toast({
        title: 'Some uploads failed',
        description: `${failed} file${failed === 1 ? '' : 's'} could not be uploaded. Please try again.`,
        variant: 'destructive',
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  };

  const isUploading = uploadingCount > 0;

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
            accept="image/*,application/pdf"
            multiple
            onChange={(e) => e.target.files && void uploadFiles(e.target.files)}
          />
          <Button
            className="bg-primary hover:bg-primary/90 text-white gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? `Uploading (${uploadingCount} left)` : 'Upload Files'}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "bg-white rounded-xl shadow-sm border p-6 transition-colors",
          isDragging ? "border-primary border-2 border-dashed bg-primary/5" : "border-gray-100"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
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
            <p className="text-sm text-gray-400 mt-1">Upload images here, or drag and drop files anywhere in this panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data?.data?.map((file) => (
              <div key={file.id} className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {file.mimeType?.startsWith('image/') ? (
                  <img src={file.thumbnailUrl || file.url} alt={file.altText || file.fileName} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <File className="w-12 h-12 text-gray-300" />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <p className="text-white text-xs px-2 text-center truncate w-full">{file.fileName}</p>
                  <p className="text-white/70 text-[10px]">{formatBytes(file.size)}</p>
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
