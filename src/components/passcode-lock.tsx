
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { KeyRound, Lock, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PasscodeLockProps {
  passcode: string | null;
  onPasscodeSet: (passcode: string) => void;
  onUnlock: () => void;
  onPasscodeChange: (newPasscode: string) => void;
}

export default function PasscodeLock({ passcode, onPasscodeSet, onUnlock, onPasscodeChange }: PasscodeLockProps) {
  const [input, setInput] = useState('');
  const [firstPasscode, setFirstPasscode] = useState('');
  const [mode, setMode] = useState<'set' | 'confirm' | 'enter'>(passcode ? 'enter' : 'set');
  const [error, setError] = useState('');
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    setInput('');
  }, [mode]);

  const handleInputChange = (index: number, value: string) => {
    if (isNaN(Number(value)) || value.length > 1) return;
    
    const currentInput = input.split('');
    currentInput[index] = value;
    const newValue = currentInput.join('');
    
    setInput(newValue);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleAction = () => {
    setError('');

    if (mode === 'set') {
        if (input.length !== 4) {
            setError("Passcode must be 4 digits.");
            return;
        }
        setFirstPasscode(input);
        setMode('confirm');
    } else if (mode === 'confirm') {
        if (input !== firstPasscode) {
            setError("Passcodes do not match. Please try again.");
            setFirstPasscode('');
            setMode('set');
            return;
        }
        onPasscodeSet(input);
        onUnlock();
    } else { // enter mode
        if (input === passcode) {
            onUnlock();
        } else {
            setError("Incorrect passcode. Please try again.");
            setInput('');
        }
    }
  };

  const renderInputs = () => (
    <div className="flex justify-center gap-3">
        {[...Array(4)].map((_, i) => (
            <Input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="password"
                maxLength={1}
                value={input[i] || ''}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-2xl text-center"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={`Passcode digit ${i + 1}`}
            />
        ))}
    </div>
  );

  const ChangePasscodeDialog = () => {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNew, setConfirmNew] = useState('');
    const [dialogError, setDialogError] = useState('');
    const [step, setStep] = useState(1);

    const handleUpdate = () => {
        setDialogError('');
        if (step === 1) {
            if (currentPass !== passcode) {
                setDialogError("Current passcode is incorrect.");
                return;
            }
            setStep(2);
        } else {
            if (newPass.length !== 4) {
                setDialogError("New passcode must be 4 digits.");
                return;
            }
            if (newPass !== confirmNew) {
                setDialogError("New passcodes do not match.");
                return;
            }
            onPasscodeChange(newPass);
            setDialogError('');
            setIsChangeDialogOpen(false);
        }
    };
    
    return (
      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
          <DialogTrigger asChild>
              <Button variant="link" className="text-muted-foreground/90 hover:text-muted-foreground">Change Passcode</Button>
          </DialogTrigger>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Change Passcode</DialogTitle>
                  <DialogDescription>
                    {step === 1 ? "Enter your current passcode to proceed." : "Enter and confirm your new 4-digit passcode."}
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  {dialogError && (
                      <Alert variant="destructive">
                          <ShieldAlert className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{dialogError}</AlertDescription>
                      </Alert>
                  )}
                  {step === 1 ? (
                      <Input type="password" placeholder="Current Passcode" value={currentPass} onChange={e => setCurrentPass(e.target.value)} maxLength={4} />
                  ) : (
                      <div className="space-y-2">
                          <Input type="password" placeholder="New 4-digit passcode" value={newPass} onChange={e => setNewPass(e.target.value)} maxLength={4} />
                          <Input type="password" placeholder="Confirm new passcode" value={confirmNew} onChange={e => setConfirmNew(e.target.value)} maxLength={4} />
                      </div>
                  )}
              </div>
              <DialogFooter>
                  <Button onClick={handleUpdate}>{step === 1 ? 'Next' : 'Update Passcode'}</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    );
  };


  if (mode === 'enter') {
    return (
      <Card className="max-w-sm mx-auto">
        <CardHeader className="text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>
            <CardTitle>Notes Locked</CardTitle>
            <CardDescription>Enter your 4-digit passcode to view notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {renderInputs()}
            <Button onClick={handleAction} className="w-full">Unlock</Button>
        </CardContent>
        <CardFooter className="justify-center">
            <ChangePasscodeDialog />
        </CardFooter>
      </Card>
    );
  }

  // Set & Confirm Mode
  return (
    <Card className="max-w-sm mx-auto">
        <CardHeader className="text-center">
            <KeyRound className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>
            <CardTitle>{mode === 'set' ? 'Set a Passcode' : 'Confirm Passcode'}</CardTitle>
            <CardDescription>
                {mode === 'set' 
                    ? "Create a 4-digit passcode to secure your notes."
                    : "Please enter the passcode again to confirm."
                }
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             {error && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {renderInputs()}
            <Button onClick={handleAction} className="w-full">{mode === 'set' ? 'Next' : 'Set Passcode'}</Button>
        </CardContent>
    </Card>
  );
}

    