import express from 'express';

const router = express.Router();

router.post('/parse', async (req, res) => {
  res.status(501).json({ code: 501, msg: '文件上传功能在Serverless环境中暂不支持，请使用结构化录入方式' });
});

router.post('/confirm', (req, res) => {
  const { parseId, confirmedFields } = req.body;
  if (!parseId || !confirmedFields) {
    return res.status(400).json({ code: 400, msg: '缺少必要参数' });
  }
  res.json({ code: 200, data: { parseId, fields: confirmedFields, validation: { valid: true, warnings: [] } } });
});

export default router;