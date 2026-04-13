-- Create storage bucket for documents (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to documents bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Allow authenticated users to upload documents
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
