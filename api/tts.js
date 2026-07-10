import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  res.status(501).json({ code: 501, msg: 'TTS语音合成功能在Serverless环境中暂不支持' });
});

export default router;