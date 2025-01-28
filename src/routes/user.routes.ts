import { Router } from 'express';
import {
  addUser,
  updateScore,
  getTopUsers,
  getUserWithNeighbors,
} from '../controllers/user.controller';
import {
  validateAddUser,
  validateUpdateScore,
  validateGetTopUsers,
  validateGetUserWithNeighbors,
} from '../middlewares/validate.middleware';

const router = Router();

router.post('/addUser', validateAddUser, addUser);
router.put('/updateScore/:id', validateUpdateScore, updateScore);
router.get('/getTopUsers/:limit', validateGetTopUsers, getTopUsers);
router.get('/getUserWithNeighbors/:id', validateGetUserWithNeighbors, getUserWithNeighbors);

export default router;