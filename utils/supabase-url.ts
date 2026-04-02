export const getSupabaseFileUrl = (path: string) => {
    if (!path) return '';
    
    // If the path is already a full URL or a base64 data URI, return it directly
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = 'chat-attachments';
    if (!supabaseUrl) return path;

    // Clean the path if it starts with slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
};
