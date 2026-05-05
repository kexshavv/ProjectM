import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let totalProjects = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;

    if (session.user.role === 'Admin') {
      totalProjects = await Project.countDocuments();
      totalTasks = await Task.countDocuments();
      completedTasks = await Task.countDocuments({ status: 'Done' });
      pendingTasks = totalTasks - completedTasks;
      overdueTasks = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $ne: 'Done' } });
    } else {
      totalProjects = await Project.countDocuments({ members: session.user.id });
      totalTasks = await Task.countDocuments({ assignedTo: session.user.id });
      completedTasks = await Task.countDocuments({ assignedTo: session.user.id, status: 'Done' });
      pendingTasks = totalTasks - completedTasks;
      overdueTasks = await Task.countDocuments({ assignedTo: session.user.id, dueDate: { $lt: new Date() }, status: { $ne: 'Done' } });
    }

    // Get upcoming tasks
    const upcomingTasksQuery = session.user.role === 'Admin' ? {} : { assignedTo: session.user.id };
    const upcomingTasks = await Task.find({ ...upcomingTasksQuery, status: { $ne: 'Done' } })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'name');

    return NextResponse.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      upcomingTasks,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
