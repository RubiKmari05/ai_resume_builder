import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, title, content } = body;

        // Typically you would verify the session via the server-side supabase client here,
        // For simplicity in this demo, we use the client-side session passing user ID.

        if (!userId || !content) {
            return NextResponse.json({ error: 'Missing user ID or content' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('resumes')
            .insert([
                {
                    user_id: userId,
                    title: title || 'My AI Resume',
                    content: content
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, resume: data });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ resumes: data });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
