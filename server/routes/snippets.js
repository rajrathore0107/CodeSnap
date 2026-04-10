const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/public', async (req, res) => {
  try {
    const { language, tag, search, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = { isPublic: true };

    if (language) where.language = language;
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.snippet.count({ where }),
    ]);

    res.json({
      snippets,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/share/:shareId', async (req, res) => {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { shareId: req.params.shareId },
      include: { user: { select: { name: true } } },
    });

    if (!snippet || !snippet.isPublic) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const snippets = await prisma.snippet.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });
    res.json(snippets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, code, language, tags, isPublic } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ message: 'Title, code and language are required' });
    }

    const snippet = await prisma.snippet.create({
      data: {
        title,
        description: description || '',
        code,
        language,
        tags: tags || [],
        isPublic: isPublic || false,
        userId: req.user.userId,
      },
    });

    res.status(201).json(snippet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const snippet = await prisma.snippet.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    const updated = await prisma.snippet.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const snippet = await prisma.snippet.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    await prisma.snippet.delete({ where: { id: req.params.id } });
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;