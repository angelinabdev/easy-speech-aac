"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Poco",
        artist: "Roo Walker",
        url: "https://cdn.uppbeat.io/audio/slug/poco.mp3",
        uppbeatUrl: "https://uppbeat.io/t/roo-walker/poco",
        license: "ORMZGL9CGL0BG0BK"
    },
    {
        title: "Winter Storm",
        artist: "Brock Hewitt",
        url: "https://cdn.uppbeat.io/audio/slug/winter-storm.mp3",
        uppbeatUrl: "https://uppbeat.io/t/brock-hewitt-stories-in-sound/winter-storm",
        license: "EUHZFMICI1RAV5BG"
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
                        Music from <a href={track.uppbeatUrl} target="_blank" rel="noopener noreferrer" className="underline">Uppbeat</a>. License code: <strong>{track.license}</strong>
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
