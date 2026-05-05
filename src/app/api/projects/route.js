import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User'; // Need to populate owner/members

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let projects;
    if (session.user.role === 'Admin') {
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: session.user.id })
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    
    const { name, description, members } = await request.json();

    if (!name || !description) {
      return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
    }

    // Always include the owner in the members list
    const memberSet = new Set(members || []);
    memberSet.add(session.user.id);

    const project = await Project.create({
      name,
      description,
      owner: session.user.id,
      members: Array.from(memberSet),
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
