"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Poco",
        artist: "Roo Walker",
        url: "https://cdn.pixabay.com/audio/2022/11/17/audio_82c678c049.mp3",
        uppbeatUrl: "https://pixabay.com/music/solo-guitar-poco-125944/",
        license: "Pixabay License"
    },
    {
        title: "Morning Garden",
        artist: "Olexy",
        url: "https://cdn.pixabay.com/audio/2023/10/23/audio_a734d5c90b.mp3",
        uppbeatUrl: "https://pixabay.com/music/acoustic-group-morning-garden-acoustic-chill-173004/",
        license: "Pixabay License"
    },
     {
        title: "Empty Mind",
        artist: "Lofi-fi",
        url: "https://cdn.pixabay.com/audio/2023/04/18/audio_27b2933068.mp3",
        uppbeatUrl: "https://pixabay.com/music/lofi-empty-mind-145410/",
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
                        Music from <a href={track.uppbeatUrl} target="_blank" rel="noopener noreferrer" className="underline">Pixabay</a>. License: {track.license}
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
