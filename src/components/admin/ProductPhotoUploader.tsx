'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductImage from '@/components/ProductImage'

export default function ProductPhotoUploader({ path, disabled, onChange, onBusyChange }: {
  path: string | null; disabled: boolean; onChange: (path: string | null) => void; onBusyChange: (busy: boolean) => void
}) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 1, maxSize: 5 * 1024 * 1024, disabled,
    onDropRejected: () => setError('Choose one JPEG, PNG or WebP image up to 5 MB.'),
    onDropAccepted: (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError('')
      setProgress(0)
      onBusyChange(true)
      const form = new FormData()
      form.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/products/photo')
      xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)) }
      xhr.onload = () => {
        try {
          const result: unknown = JSON.parse(xhr.responseText)
          if (xhr.status < 200 || xhr.status >= 300 || !result || typeof result !== 'object' || !('path' in result) || typeof result.path !== 'string') {
            const message = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'Upload failed'
            throw new Error(message)
          }
          onChange(result.path)
          toast.success('Photo uploaded. Save the product to publish it.')
        } catch (err) {
          console.error('Product photo upload failed:', err)
          setError(err instanceof Error ? err.message : 'Upload failed')
        } finally { setProgress(null); onBusyChange(false) }
      }
      xhr.onerror = () => { setError('Network error while uploading photo'); setProgress(null); onBusyChange(false) }
      xhr.onabort = () => { setError('Photo upload was interrupted'); setProgress(null); onBusyChange(false) }
      xhr.send(form)
    },
  })

  return <div className="space-y-2">
    <span className="text-sm font-medium">Product photo</span>
    <div {...getRootProps()} className={`cursor-pointer rounded-xl border border-dashed p-4 text-center transition ${isDragActive ? 'border-accent bg-accent/10' : 'border-white/20 bg-black/20 hover:border-accent/60'} ${disabled ? 'opacity-50' : ''}`}>
      <input {...getInputProps()} aria-label="Upload product photo" />
      {path ? <ProductImage path={path} name="Selected product" className="mx-auto h-32 w-32 rounded-lg" /> : <UploadCloud className="mx-auto text-accent" size={30} />}
      <p className="mt-2 text-sm">Drop an image here or tap to choose</p>
      <p className="mt-1 text-xs text-gray-400">JPEG, PNG or WebP · up to 5 MB. The image is resized automatically without cropping.</p>
    </div>
    {progress !== null && <div role="status" className="text-sm text-accent">{progress < 100 ? `Uploading ${progress}%` : 'Processing and saving photo...'}<progress className="mt-1 block w-full" value={progress} max={100} /></div>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    {path && <button type="button" disabled={disabled} onClick={() => onChange(null)} className="flex items-center gap-1 text-sm text-red-300 underline"><Trash2 size={14} />Remove photo</button>}
  </div>
}
