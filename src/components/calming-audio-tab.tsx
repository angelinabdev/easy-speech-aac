"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Peaceful Mind",
        artist: "Ars Sonor",
        url: "https://archive.org/download/PeacefulMind/PeacefulMind.mp3",
        sourceUrl: "https://archive.org/details/PeacefulMind",
        license: "Public Domain"
    },
    {
        title: "Relaxing Green Nature",
        artist: "gdsounds",
        url: "https://archive.org/download/RelaxingGreenNature/RelaxingGreenNature.mp3",
        sourceUrl: "https://archive.org/details/RelaxingGreenNature",
        license: "Public Domain"
    },
     {
        title: "Calm and Peaceful",
        artist: "Lesfm",
        url: "https://archive.org/download/Calm-and-Peaceful/Calm%20and%20Peaceful.mp3",
        sourceUrl: "https://archive.org/details/Calm-and-Peaceful",
        license: "Public Domain"
    }
];

export default function CalmingAudioTab() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>🎧 Calming Audio</CardTitle>
            <CardDescription>Listen to some relaxing music to help you feel calm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {audioTracks.map((track) => (
                 <div key={track.title} className="p-4 border rounded-lg bg-secondary/50">
                    <h3 className="font-semibold">{track.title} by {track.artist}</h3>
                    <audio controls className="w-full mt-2">
                        <source src={track.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <p className="text-xs text-muted-foreground mt-2">
                        Music from <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">The Internet Archive</a>. License: <strong>{track.license}</strong>
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
