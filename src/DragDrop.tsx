// DragDrop.tsx
import React, { useCallback, useState } from "react"

export default function DragDrop({ onText }: { onText: (t: string) => void }) {
  const [hover, setHover] = useState(false)

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const text = await file.text()
    onText(text)
  }, [onText])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setHover(true) }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      className={`border-2 rounded-xl p-6 text-center ${hover ? "border-dashed" : "border-solid"}`}
      role="button"
      tabIndex={0}
    >
      Drag & drop a file here, or click to browse
      <input
        type="file"
        accept=".txt,.md,.pdf,.doc,.docx"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const t = await f.text()
          onText(t)
        }}
        className="hidden"
        aria-label="Upload file"
      />
    </div>
  )
}
