import User from '../db/User.js';
import bcrypt from 'bcrypt';

// פונקציה להוספת משתמש חדש
export const addUser = async (req, res) => {
  const {firstName, lastName, email, password } = req.body;
  console.log("Received user data:", req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error("Error in /add route:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// פונקציה לקבלת כל המשתמשים
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// פונקציה לקבלת משתמש לפי ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // חיפוש משתמש לפי דוא"ל
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    console.log('User found:', user);

    // בדיקת סיסמה
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password matches:', passwordMatch);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // החזרת פרטי המשתמש
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};
