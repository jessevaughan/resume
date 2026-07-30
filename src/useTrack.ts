import { useEffect, useState } from 'react'
import { DEFAULT_TRACK, TRACKS, type Track } from './resume-schema'

function parseTrack(search: string): Track {
  const value = new URLSearchParams(search).get('track')
  return (TRACKS as readonly string[]).includes(value ?? '')
    ? (value as Track)
    : DEFAULT_TRACK
}

/**
 * I keep the track in the URL (?track=engineering), so a given track is a
 * linkable, printable artifact. The default track keeps a clean URL with
 * no param. Back/forward navigation stays in sync via popstate.
 */
export function useTrack(): [Track, (track: Track) => void] {
  const [track, setTrackState] = useState<Track>(() =>
    parseTrack(window.location.search),
  )

  useEffect(() => {
    const onPop = () => setTrackState(parseTrack(window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const setTrack = (next: Track) => {
    const url = new URL(window.location.href)
    if (next === DEFAULT_TRACK) url.searchParams.delete('track')
    else url.searchParams.set('track', next)
    window.history.pushState({}, '', url)
    setTrackState(next)
  }

  return [track, setTrack]
}
