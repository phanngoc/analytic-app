'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Download, Check } from 'lucide-react';
import { apiService } from '@/lib/api';

interface ScriptViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ScriptViewerDialog({
  isOpen,
  onClose,
  project
}: ScriptViewerDialogProps) {
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      loadScript();
    }
  }, [isOpen, project]);

  const loadScript = async () => {
    if (!project) return;
    
    setLoading(true);
    try {
      const scriptContent = await apiService.getTrackingScript(project.id);
      setScript(scriptContent);
    } catch (error) {
      console.error('Failed to load script:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy script:', error);
    }
  };

  const handleDownload = async () => {
    if (!project) return;
    
    try {
      const blob = await apiService.downloadTrackingScript(project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${project.domain}.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download script:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Tracking Script - {project?.name}</DialogTitle>
          <DialogDescription>
            Copy this script and include it in your website's HTML to start tracking events.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading script...</div>
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-[400px] border">
                <code>{script}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm">
          <p className="font-medium mb-1">Integration Instructions:</p>
          <ol className="text-muted-foreground space-y-1 text-xs">
            <li>1. Copy the script above or download it as a file</li>
            <li>2. Include it in your website's &lt;head&gt; section</li>
            <li>3. The script will automatically start tracking page views</li>
            <li>4. Use <code>analytics.track()</code> to send custom events</li>
          </ol>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Script
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
