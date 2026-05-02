import StockMovement from '../models/StockMovement.js';

export async function listStockMovements(req, res) {
  const { itemId, departmentId, type, page = 1, limit = 25 } = req.query;
  const query = {
    ...(itemId ? { itemId } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(type ? { type } : {})
  };
  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [movements, total] = await Promise.all([
    StockMovement.find(query).populate('itemId performedBy departmentId').sort({ date: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
    StockMovement.countDocuments(query)
  ]);
  res.json({ movements, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
}
