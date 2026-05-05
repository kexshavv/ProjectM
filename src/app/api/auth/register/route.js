import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Please provide all fields' }, { status: 400 });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    // The first user could be an Admin, or we can just default to Member for now
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'Admin' : 'Member';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (user) {
      return NextResponse.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Check if it's a mongoose/mongodb connection error
    if (error.name === 'MongooseError' || error.message.includes('ECONNREFUSED') || error.message.includes('failed to connect')) {
      return NextResponse.json({ 
        message: 'Database connection failed. Please ensure MongoDB is running or update MONGODB_URI in .env.local.' 
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Server error during registration' }, { status: 500 });
  }
}
