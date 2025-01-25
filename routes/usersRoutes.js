import express from 'express';
import { addUser, getAllUsers, getUserById, login } from '../controllers/userController.js';

const router = express.Router();

// ראוט להוספת משתמש חדש
router.post('/add', addUser);

// ראוט לקבלת כל המשתמשים
router.get('/all', getAllUsers);

// ראוט לקבלת משתמש לפי ID
router.get('/:id', getUserById);

//לוגין 
router.post('/login',login)

export default router;
