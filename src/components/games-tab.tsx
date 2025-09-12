"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

// --- Sentence Builder Game ---

function SentenceBuilderGame() {
    // This will hold the game logic. For now, it's a placeholder.
    return (
        <div className="space-y-4">
            <div className="p-4 border-2 border-dashed rounded-lg min-h-[100px] flex items-center justify-center">
                <p className="text-muted-foreground">Drop words here to build a sentence.</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg min-h-[100px] flex items-center justify-center gap-2">
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">The</div>
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">dog</div>
                 <div className="p-2 px-4 bg-primary text-primary-foreground rounded-lg shadow cursor-grab">plays</div>
            </div>
             <Button className="w-full">Check Sentence</Button>
        </div>
    );
}

function SentenceBuilder() {
  return (
      <Card>
          <CardHeader>
              <CardTitle>Sentence Builder</CardTitle>
              <CardDescription>Drag and drop words to build simple sentences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full">Play Now</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Build a Sentence</DialogTitle>
                    </DialogHeader>
                    <SentenceBuilderGame />
                </DialogContent>
            </Dialog>
          </CardContent>
      </Card>
  );
}


export default function GamesTab() {
  return (
    <div>
        <SentenceBuilder />
    </div>
  );
}
