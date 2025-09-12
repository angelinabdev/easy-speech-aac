"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export default function GamesTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Picture-Word Matching</CardTitle>
                <CardDescription>Match the images to the correct words to practice vocabulary.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Game coming soon!</p>
                </div>
                <Button className="w-full mt-4" disabled>Play Now</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Sentence Builder</CardTitle>
                <CardDescription>Drag and drop words to build simple sentences.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 bg-secondary rounded-lg">
                    <p className="text-muted-foreground">Game coming soon!</p>
                </div>
                <Button className="w-full mt-4" disabled>Play Now</Button>
            </CardContent>
        </Card>
    </div>
  );
}
