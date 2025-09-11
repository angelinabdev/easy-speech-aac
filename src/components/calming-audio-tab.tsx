"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Poco",
        artist: "Roo Walker",
        url: "https://cdn.pixabay.com/audio/2022/11/11/audio_a7a4a91a92.mp3",
        uppbeatUrl: "https://pixabay.com/music/unplugged-poco-125942/",
        license: "Pixabay License"
    },
    {
        title: "Winter Storm",
        artist: "Brock Hewitt",
        url: "https://cdn.pixabay.com/audio/2023/10/26/audio_a70a84aa24.mp3",
        uppbeatUrl: "https://pixabay.com/music/ambient-winter-storm-173531/",
        license: "Pixabay License"
    },
     {
        title: "Rain and Thunder",
        artist: "Relaxing Sounds",
        url: "https://cdn.pixabay.com/audio/2021/08/17/audio_9a36dc8a99.mp3",
        uppbeatUrl: "https://pixabay.com/sound-effects/rain-and-thunder-14115/",
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
                        Music from Pixabay. License: {track.license}
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
