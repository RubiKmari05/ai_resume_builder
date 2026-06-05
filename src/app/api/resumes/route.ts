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
    const resumeId = searchParams.get('resumeId');

    if (!userId && !resumeId) {
        return NextResponse.json({ error: 'User ID or Resume ID is required' }, { status: 400 });
    }

    try {
        if (resumeId) {
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();

            if (error) throw error;
            return NextResponse.json({ resume: data });
        }

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

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, title, content } = body;

        if (!id || !content) {
            return NextResponse.json({ error: 'Missing resume ID or content' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('resumes')
            .update({
                title: title || 'My AI Resume',
                content: content
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, resume: data });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

