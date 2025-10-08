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
        name: "Autistic Self Advocacy Network (ASAN)",
        description: "A nonprofit organization run by and for autistic people, advancing disability rights.",
        url: "https://autisticadvocacy.org"
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
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-accent"/>
                    Donate Today
                </CardTitle>
                <CardDescription>Your contribution helps us fund autism research and keep this tool free for everyone.</CardDescription>
            </CardHeader>
            <CardContent>
                <a href="https://www.gofundme.com/f/easy-speech-aac-app-for-autism-research" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Donate on GoFundMe <ExternalLink className="ml-2 h-4 w-4"/></Button>
                </a>
            </CardContent>
      </Card>
    </div>
  );
}
