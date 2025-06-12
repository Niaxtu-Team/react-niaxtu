import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUser, 
  deleteUser, 
  getAllUsers 
} from '../controllers/userController.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Routes protégées (nécessitent une authentification)
router.get('/profile', verifyFirebaseToken, getUserProfile);
router.put('/profile', verifyFirebaseToken, updateUserProfile);
router.delete('/profile', verifyFirebaseToken, deleteUser);

// Route pour créer un utilisateur (appelée après inscription Firebase Auth)
router.post('/create', createUser);

// Route admin pour obtenir tous les utilisateurs
router.get('/all', verifyFirebaseToken, getAllUsers);

export default router; 