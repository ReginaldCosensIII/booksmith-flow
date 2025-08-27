-- Create exports table to track export history
CREATE TABLE IF NOT EXISTS public.exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  format TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_url TEXT NOT NULL DEFAULT '',
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view exports for their own projects" 
ON public.exports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = exports.project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create exports for their own projects" 
ON public.exports 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = exports.project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update exports for their own projects" 
ON public.exports 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = exports.project_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete exports for their own projects" 
ON public.exports 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = exports.project_id AND p.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exports_updated_at
BEFORE UPDATE ON public.exports
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();