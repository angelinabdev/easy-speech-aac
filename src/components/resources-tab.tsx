"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Gift } from 'lucide-react';

const resources = [
    {
        name: "Autism Speaks",
        description: "Promoting awareness, advocacy, and research for autism spectrum disorders.",
        url: "https://www.autismspeaks.org"
    },
    {
        name: "Autism Society",
        description: "Offers support to improve the lives of people with autism and their families.",
        url: "https://www.autism-society.org"
    },
    {
        name: "Understood.org",
        description: "Resources and community for people with learning and attention issues.",
        url: "https://www.understood.org"
    }
];

export default function ResourcesTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>Helpful links for caregivers and disability support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {resources.map(resource => (
                    <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{resource.name}</h3>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                    </a>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Donate Today</CardTitle>
                <CardDescription>Support autism research and services.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center h-full space-y-4">
                <p className="text-muted-foreground">
                    If you'd like to support autism research, please consider donating through the official GoFundMe campaign for the Organization for Autism Research.
                </p>
                <a href="https://gofund.me/66f8d46d4" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                        <Gift className="mr-2 h-5 w-5" /> Donate on GoFundMe
                    </Button>
                </a>
                <p className="text-xs text-muted-foreground">100% of donations go directly to the Organization for Autism Research.</p>
            </CardContent>
        </Card>
    </div>
  );
}
