"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Empty Mind",
        artist: "Lofi-fi",
        url: "https://cdn.pixabay.com/audio/2023/04/18/audio_27b2933068.mp3",
        sourceUrl: "https://pixabay.com/music/lofi-empty-mind-145410/",
        license: "Pixabay License"
    },
    {
        title: "Just Relax",
        artist: "Lesfm",
        url: "https://cdn.pixabay.com/audio/2022/11/17/audio_8ac9c6a17b.mp3",
        sourceUrl: "https://pixabay.com/music/beats-just-relax-127201/",
        license: "Pixabay License"
    },
     {
        title: "Lofi Chill",
        artist: "FASSounds",
        url: "https://cdn.pixabay.com/audio/2022/05/27/audio_18c1109935.mp3",
        sourceUrl: "https://pixabay.com/music/lofi-lofi-chill-111831/",
        license: "Pixabay License"
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
                        Music from <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Pixabay</a>. License: <strong>{track.license}</strong>
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
