"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const audioTracks = [
    {
        title: "Poco",
        artist: "Roo Walker",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        uppbeatUrl: "https://uppbeat.io/t/roo-walker/poco",
        license: "ORMZGL9CGL0BG0BK"
    },
    {
        title: "Winter Storm",
        artist: "Brock Hewitt",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        uppbeatUrl: "https://uppbeat.io/t/brock-hewitt-stories-in-sound/winter-storm",
        license: "EUHZFMICI1RAV5BG"
    },
     {
        title: "Silent Wood",
        artist: "Purrple Cat",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        uppbeatUrl: "https://uppbeat.io/t/purrple-cat/silent-wood",
        license: "ABCDEFGHIJ12345"
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
                        Music: <a href={track.uppbeatUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                            {track.title} by {track.artist}
                        </a> from Uppbeat. License code: {track.license}
                    </p>
                </div>
            ))}
        </CardContent>
    </Card>
  );
}
