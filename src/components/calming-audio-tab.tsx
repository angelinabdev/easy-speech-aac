"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Calm Sea",
        artist: "InSintesi",
        url: "https://cdn.freesound.org/previews/570/570576_7306235-hq.mp3",
        sourceUrl: "https://freesound.org/people/InSintesi/sounds/570576/",
        license: "CC0 1.0"
    },
    {
        title: "Peaceful Garden",
        artist: "soundmary",
        url: "https://cdn.freesound.org/previews/613/613205_11861999-hq.mp3",
        sourceUrl: "https://freesound.org/people/soundmary/sounds/613205/",
        license: "CC BY 4.0"
    },
     {
        title: "Soothing White Noise",
        artist: "qubodup",
        url: "https://cdn.freesound.org/previews/122/122176_1015240-hq.mp3",
        sourceUrl: "https://freesound.org/people/qubodup/sounds/122176/",
        license: "CC0 1.0"
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
                        Music from <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Freesound.org</a>. License: <strong>{track.license}</strong>
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
