const express = require('express');
const router = express.Router();
const {
  chatCompletion,
  research,
  writingSuite,
  learningTutor,
  visionOCR,
  getProvidersList
} = require('../controllers/chat.controller');

// Map endpoints to controllers
router.post('/chat', chatCompletion);
router.post('/research', research);
router.post('/writing', writingSuite);
router.post('/learning', learningTutor);
router.post('/vision', visionOCR);
router.get('/providers', getProvidersList);

module.exports = router;
