import { Router } from 'express';
import { addUser, updateScore, getTopUsers, getUserWithNeighbors } from '../controllers/user.controller';

const router = Router();

// Define user-related routes
router.post('/addUser', addUser);
router.put('/updateScore/:id', updateScore);
router.get('/getTopUsers/:limit', getTopUsers);
router.get('/getUserWithNeighbors/:id', getUserWithNeighbors);

export default router;