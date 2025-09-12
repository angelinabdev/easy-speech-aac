"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Peaceful Mind",
        artist: "Zakhar Valaha",
        url: "https://assets.mixkit.co/music/preview/mixkit-peaceful-mind-1165.mp3",
        sourceUrl: "https://mixkit.co/free-stock-music/ambient/",
        license: "Mixkit License"
    },
    {
        title: "Sleepy Cat",
        artist: "Alejandro Magaña",
        url: "https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3",
        sourceUrl: "https://mixkit.co/free-stock-music/ambient/",
        license: "Mixkit License"
    },
     {
        title: "Just Chill",
        artist: "Ahjay Stelino",
        url: "https://assets.mixkit.co/music/preview/mixkit-just-chill-16.mp3",
        sourceUrl: "https://mixkit.co/free-stock-music/ambient/",
        license: "Mixkit License"
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
                        Music from <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Mixkit</a>. License: <strong>{track.license}</strong>
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
