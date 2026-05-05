import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Task from '@/models/Task';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    
    const task = await Task.findById(resolvedParams.id).populate('project');
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Admins can update any task. Members can only update their own tasks.
    if (session.user.role !== 'Admin' && task.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    
    // Members can only update status
    if (session.user.role !== 'Admin') {
      task.status = data.status || task.status;
      await task.save();
      await task.populate('assignedTo', 'name email');
      return NextResponse.json(task);
    }

    const updatedTask = await Task.findByIdAndUpdate(resolvedParams.id, data, { new: true, runValidators: true }).populate('assignedTo', 'name email');
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const resolvedParams = await params;
    
    const task = await Task.findByIdAndDelete(resolvedParams.id);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
