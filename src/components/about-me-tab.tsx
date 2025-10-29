
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AboutMeData } from '@/lib/user-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Trash2, User as UserIcon, Phone, Plus, Clipboard, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import debounce from 'lodash/debounce';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface AboutMeTabProps {
  aboutMeData: AboutMeData;
  onUpdate: (newData: AboutMeData) => void;
}

export default function AboutMeTab({ aboutMeData, onUpdate }: AboutMeTabProps) {
  const [data, setData] = useState<AboutMeData>(aboutMeData);

  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    setData(aboutMeData);
  }, [aboutMeData]);
  
  const debouncedOnUpdate = useCallback(debounce(onUpdate, 500), [onUpdate]);

  const handleDataChange = (field: keyof AboutMeData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    debouncedOnUpdate(newData);
  };
  
  const addToList = (listName: 'contacts' | 'likes' | 'dislikes') => {
      let newItem;
      let existingList = data[listName] || [];

      if (listName === 'contacts' && newContactName && newContactRelation && newContactPhone) {
          newItem = { id: Date.now().toString(), name: newContactName, relation: newContactRelation, phone: newContactPhone };
          setNewContactName('');
          setNewContactRelation('');
          setNewContactPhone('');
      } else if (listName === 'likes' && newLike) {
          newItem = { id: Date.now().toString(), text: newLike };
          setNewLike('');
      } else if (listName === 'dislikes' && newDislike) {
          newItem = { id: Date.now().toString(), text: newDislike };
          setNewDislike('');
      }

      if (newItem) {
          // @ts-ignore
          const newList = [...existingList, newItem];
          onUpdate({ ...data, [listName]: newList });
      }
  };

  const deleteItem = <T extends {id: string}>(items: T[] | undefined, field: keyof AboutMeData, id: string) => {
    if (items) {
      onUpdate({ ...data, [field]: items.filter(item => item.id !== id) });
    }
  };
  
  const getShareableText = () => {
    const { name, contacts, medical, communication, likes, dislikes } = data;
    let text = `--- ABOUT ME ---\n`;
    text += `Name: ${name || 'Not specified'}\n\n`;
    text += `--- EMERGENCY CONTACTS ---\n`;
    if (contacts && contacts.length > 0) {
        contacts.forEach(c => {
            text += `- ${c.name} (${c.relation}): ${c.phone}\n`;
        });
    } else {
        text += 'No contacts listed.\n';
    }
    text += `\n--- ALLERGIES & MEDICAL NOTES ---\n`;
    text += `${medical || 'No notes.'}\n\n`;
    text += `--- COMMUNICATION STYLE ---\n`;
    text += `${communication || 'Not specified.'}\n\n`;
    text += `--- LIKES ---\n`;
    text += (likes && likes.length > 0) ? likes.map(l => `- ${l.text}`).join('\n') : 'No likes listed.';
    text += `\n\n--- DISLIKES ---\n`;
    text += (dislikes && dislikes.length > 0) ? dislikes.map(d => `- ${d.text}`).join('\n') : 'No dislikes listed.';
    return text;
  }

  const handleShare = () => {
    const shareText = getShareableText();
    navigator.clipboard.writeText(shareText);
    toast({
        title: "Information Copied!",
        description: "Your 'About Me' info has been copied to the clipboard.",
    });
  };

  const generatePrintableHTML = () => {
    const { name, contacts, medical, communication, likes, dislikes } = data;
    const styles = `
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.5; color: #333; margin: 1em; font-size: 14px; }
        .container { max-width: 800px; margin: auto; }
        h1 { font-size: 1.8em; text-align: center; margin-bottom: 0.5em; color: #111; }
        h2 { font-size: 1.2em; color: #111; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; margin-bottom: 0.8em; }
        p, ul { color: #555; margin: 0; }
        ul { list-style-position: inside; padding-left: 0; }
        li { margin-bottom: 0.3em; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5em; margin-top: 1.5em; }
        .col-span-2 { grid-column: span 2; }
        .card { background-color: #f9f9f9; padding: 1em; border-radius: 8px; margin-bottom: 1em; }
        .contact-item { display: flex; justify-content: space-between; padding: 0.2em 0; }
    `;

    let html = `<html><head><title>About ${name || 'Me'}</title><style>${styles}</style></head><body><div class="container">`;
    html += `<h1>About ${name || 'Me'}</h1>`;

    html += `<div class="card col-span-2"><h2>Communication Style</h2><p>${communication || 'Not specified.'}</p></div>`;
    html += `<div class="card col-span-2"><h2>Allergies & Medical Notes</h2><p>${medical || 'No notes.'}</p></div>`;

    html += `<div class="grid">`;
    html += `<div class="card"><h2>Likes</h2><ul>${(likes && likes.length > 0) ? likes.map(l => `<li>${l.text}</li>`).join('') : '<li>No likes listed.</li>'}</ul></div>`;
    html += `<div class="card"><h2>Dislikes</h2><ul>${(dislikes && dislikes.length > 0) ? dislikes.map(d => `<li>${d.text}</li>`).join('') : '<li>No dislikes listed.</li>'}</ul></div>`;
    html += `</div>`;

    html += `<div class="card col-span-2"><h2>Emergency Contacts</h2>${(contacts && contacts.length > 0) ? contacts.map(c => `<div class="contact-item"><p><strong>${c.name}</strong> (${c.relation})</p><p>${c.phone}</p></div>`).join('') : '<p>No contacts listed.</p>'}</div>`;

    html += `</div></body></html>`;
    return html;
  };

  const handlePrint = () => {
    const printHtml = generatePrintableHTML();
    const printWindow = window.open();

    if (printWindow) {
        printWindow.document.write(printHtml);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        }
    } else {
         toast({
            variant: "destructive",
            title: "Could not open new tab",
            description: "Your browser may have blocked the new tab. Please allow popups for this site.",
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 flex-wrap">
        <div className="flex-1">
          <h2 className="text-3xl font-bold">About Me</h2>
          <p className="text-sm text-muted-foreground">Help caregivers get to know you better and understand your preferences!</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handleShare} variant="secondary"><Clipboard className="mr-2 h-4 w-4"/> Share</Button>
            <Button onClick={handlePrint} variant="secondary"><Printer className="mr-2 h-4 w-4"/> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name/Nickname</Label>
              <Input id="name" value={data.name || ''} onChange={(e) => handleDataChange('name', e.target.value)} placeholder="Enter your display name..." />
            </div>
            <div>
              <Label htmlFor="medical">Allergies & Medical Notes</Label>
              <Textarea id="medical" value={data.medical || ''} onChange={(e) => handleDataChange('medical', e.target.value)} placeholder="e.g., Allergic to peanuts, asthma..." />
            </div>
             <div>
              <Label htmlFor="communication">Communication Style</Label>
              <Textarea id="communication" value={data.communication || ''} onChange={(e) => handleDataChange('communication', e.target.value)} placeholder="e.g., I use this app to talk. Please be patient." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Emergency Contacts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Name" aria-label="New contact name" />
                <Input value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} placeholder="Relation (e.g., Mom)" aria-label="New contact relation" />
                <Input type="tel" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="Phone Number" aria-label="New contact phone" />
                <Button onClick={() => addToList('contacts')} className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Contact</Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {(data.contacts || []).map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4"/>
                            <div>
                               <p className="font-semibold">{c.name} <span className="text-xs text-muted-foreground">({c.relation})</span></p>
                               <p className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1"/>{c.phone}</p>
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label={`Delete contact ${c.name}`}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete the contact "{c.name}".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteItem(data.contacts, 'contacts', c.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>My Favorite Things (Likes)</CardTitle></CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input value={newLike} onChange={e => setNewLike(e.target.value)} placeholder="e.g., Watching cartoons" aria-label="New like" />
                    <Button onClick={() => addToList('likes')} aria-label="Add like"><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(data.likes || []).map(l => (
                        <div key={l.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{l.text}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label={`Delete like: ${l.text}`}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this like?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete the like "{l.text}".</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteItem(data.likes, 'likes', l.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Things I Don't Like (Dislikes)</CardTitle></CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input value={newDislike} onChange={e => setNewDislike(e.target.value)} placeholder="e.g., Loud noises" aria-label="New dislike" />
                    <Button onClick={() => addToList('dislikes')} aria-label="Add dislike"><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(data.dislikes || []).map(d => (
                        <div key={d.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{d.text}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" aria-label={`Delete dislike: ${d.text}`}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this dislike?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete the dislike "{d.text}".</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteItem(data.dislikes, 'dislikes', d.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
    

    