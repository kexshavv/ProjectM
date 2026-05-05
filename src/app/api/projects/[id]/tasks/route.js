import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    
    const project = await Project.findById(resolvedParams.id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Check access
    if (session.user.role !== 'Admin' && !project.members.includes(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const tasks = await Task.find({ project: resolvedParams.id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    
    const { title, description, status, dueDate, assignedTo } = await request.json();

    if (!title) {
      return NextResponse.json({ message: 'Please provide a title' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      dueDate,
      project: resolvedParams.id,
      assignedTo: assignedTo || null,
    });

    // Populate assignedTo immediately to return it
    await task.populate('assignedTo', 'name email');

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
