/**
 * Type declarations for jsmpeg
 * jsmpeg doesn't have official TypeScript types, so we declare them here
 */
declare module "jsmpeg" {
  interface JSMpegOptions {
    canvas?: HTMLCanvasElement
    loop?: boolean
    autoplay?: boolean
    audio?: boolean
    video?: boolean
    poster?: string
    pauseWhenHidden?: boolean
    disableGl?: boolean
    disableWebAssembly?: boolean
    preserveDrawingBuffer?: boolean
    progressive?: boolean
    throttled?: boolean
    chunkSize?: number
    onVideoDecode?: (decoder: any, time: number) => void
    onAudioDecode?: (decoder: any, time: number) => void
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    onStalled?: () => void
    onSourceEstablished?: (source: any) => void
    onSourceCompleted?: (source: any) => void
  }

  class JSMpeg {
    constructor(url: string | HTMLCanvasElement, options?: JSMpegOptions)
    destroy(): void
    play(): void
    pause(): void
    stop(): void
    volume: number
    currentTime: number
    duration: number
    paused: boolean
    ended: boolean
  }

  export default JSMpeg
}
