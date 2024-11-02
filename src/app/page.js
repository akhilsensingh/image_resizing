'use client'

import React, { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState(null)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [format, setFormat] = useState('jpeg')
  const [watermark, setWatermark] = useState('')
  const [resizedImageId, setResizedImageId] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)
    if (width) formData.append('width', width)
    if (height) formData.append('height', height)
    formData.append('format', format)
    if (watermark) formData.append('watermark', watermark)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Image upload failed')
      }

      const data = await response.json()
      setResizedImageId(data.imageId)
      setError(null)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Image upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Image Resizer</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-gray-900
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  {preview && (
                    <div className="mt-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-40 mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Width in pixels"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height in pixels"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Text (Optional)
              </label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="Add watermark text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Resize Image'}
            </button>
          </form>

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {resizedImageId && (
            <div className="mt-4 text-center">
              <p className="text-sm text-green-600 mb-2">Image resized successfully!</p>
              <a
                href={`/api/download/${resizedImageId}`}
                download
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download Resized Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}