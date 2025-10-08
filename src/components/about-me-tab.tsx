
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AboutMeData } from '@/lib/user-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Trash2, User as UserIcon, Phone, Plus, Clipboard, Printer, Heart, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import html2canvas from 'html2canvas';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface AboutMeTabProps {
  aboutMeData: AboutMeData;
  onUpdate: (newData: AboutMeData) => void;
}

// New component for the printable card layout
function PrintableAboutMe({ aboutMeData, innerRef }: { aboutMeData: AboutMeData, innerRef: React.Ref<HTMLDivElement> }) {
  const { name, contacts, medical, communication, likes, dislikes } = aboutMeData;

  return (
    <div ref={innerRef} className="bg-white text-black p-8 rounded-lg shadow-lg w-[800px]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">About {name || 'Me'}</h1>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold text-blue-800 border-b-2 border-blue-200 pb-2 mb-2">Communication Style</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{communication || 'Not specified.'}</p>
                </div>
                 <div className="bg-red-50 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold text-red-800 border-b-2 border-red-200 pb-2 mb-2">Allergies & Medical Notes</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{medical || 'No notes.'}</p>
                </div>
            </div>

            <div>
                <div className="bg-green-50 p-4 rounded-lg h-full">
                    <h2 className="text-2xl font-semibold text-green-800 border-b-2 border-green-200 pb-2 mb-2 flex items-center"><Heart className="mr-2"/> Likes</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {(likes && likes.length > 0) ? likes.map(l => <li key={l.id}>{l.text}</li>) : <li>No likes listed.</li>}
                    </ul>
                </div>
            </div>

            <div>
                <div className="bg-yellow-50 p-4 rounded-lg h-full">
                    <h2 className="text-2xl font-semibold text-yellow-800 border-b-2 border-yellow-200 pb-2 mb-2 flex items-center"><ThumbsDown className="mr-2"/> Dislikes</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {(dislikes && dislikes.length > 0) ? dislikes.map(d => <li key={d.id}>{d.text}</li>) : <li>No dislikes listed.</li>}
                    </ul>
                </div>
            </div>

            <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-2">Emergency Contacts</h2>
                <div className="space-y-2">
                    {(contacts && contacts.length > 0) ? contacts.map(c => (
                        <div key={c.id} className="flex justify-between items-center text-gray-700">
                           <p><strong>{c.name}</strong> ({c.relation})</p>
                           <p>{c.phone}</p>
                        </div>
                    )) : <p className="text-gray-600">No contacts listed.</p>}
                </div>
            </div>
        </div>
    </div>
  );
}


export default function AboutMeTab({ aboutMeData, onUpdate }: AboutMeTabProps) {
  const [data, setData] = useState<AboutMeData>(aboutMeData);

  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(aboutMeData);
  }, [aboutMeData]);
  
  // Debounce the update function to avoid excessive Firestore writes while typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // Use onUpdate directly for immediate feedback on additions/deletions
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

  const handlePrint = async () => {
    const element = printRef.current;
    if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');

        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print About Me</title></head><body>');
            printWindow.document.write('<img src="' + data + '" style="width:100%;" />');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            
            printWindow.onload = () => {
              printWindow.focus();
              printWindow.print();
            };
        }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden printable component */}
      <div className="fixed -left-[9999px] top-0">
        <PrintableAboutMe aboutMeData={data} innerRef={printRef} />
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">About Me</h2>
          <p className="text-muted-foreground">This information is saved to your account and available on any device. Allow your caregivers to know a little about you!</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline"><Clipboard className="mr-2 h-4 w-4"/> Share</Button>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Name" />
                <Input value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} placeholder="Relation (e.g., Mom)" />
                <Input type="tel" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="Phone Number" />
                <Button onClick={() => addToList('contacts')} size="sm" className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Contact</Button>
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
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
                    <Input value={newLike} onChange={e => setNewLike(e.target.value)} placeholder="e.g., Watching cartoons" />
                    <Button onClick={() => addToList('likes')}><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(data.likes || []).map(l => (
                        <div key={l.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{l.text}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
                    <Input value={newDislike} onChange={e => setNewDislike(e.target.value)} placeholder="e.g., Loud noises" />
                    <Button onClick={() => addToList('dislikes')}><Plus className="h-4 w-4"/></Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {(data.dislikes || []).map(d => (
                        <div key={d.id} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                            <p>{d.text}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
