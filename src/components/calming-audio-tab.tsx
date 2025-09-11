"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Relaxing Music",
        artist: "ZenLife",
        url: "https://cdn.pixabay.com/audio/2022/10/18/audio_73b906236b.mp3",
        uppbeatUrl: "https://pixabay.com/music/meditation-spiritual-relaxing-music-for-stress-relief-zen-yoga-meditation-123301/",
        license: "Pixabay License"
    },
    {
        title: "Calm and Peaceful",
        artist: "Lesfm",
        url: "https://cdn.pixabay.com/audio/2023/10/02/audio_145d2a912e.mp3",
        uppbeatUrl: "https://pixabay.com/music/beautiful-plays-calm-and-peaceful-169219/",
        license: "Pixabay License"
    },
     {
        title: "Forest Sounds",
        artist: "SoundsForYou",
        url: "https://cdn.pixabay.com/audio/2022/08/04/audio_2bbe6a6a4c.mp3",
        uppbeatUrl: "https://pixabay.com/sound-effects/forest-sound-114420/",
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
