// MediaRecorder wrapper — record mic → base64 string

export function isRecordingSupported(): boolean {
  return !!navigator.mediaDevices && 'MediaRecorder' in window
}

export function startRecording(
  onStop: (base64: string) => void
): Promise<() => void> {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const chunks: Blob[] = []
    const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg' })
    mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
    mr.onstop = () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(chunks, { type: mr.mimeType })
      const reader = new FileReader()
      reader.onload = () => onStop(reader.result as string)
      reader.readAsDataURL(blob)
    }
    mr.start()
    return () => mr.stop()
  })
}

export function playBase64Audio(b64: string): HTMLAudioElement {
  const audio = new Audio(b64)
  audio.play()
  return audio
}
