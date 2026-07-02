import { CategoryModel } from '../models/categoryModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAllCategories = catchAsync(async (_req, res) => {
  const categories = await CategoryModel.findAll();
  
  // Format to match frontend structure ({ id, name, icon }) if required
  const formatted = categories.map(cat => {
    let icon = 'sports_soccer'; // Default icon
    const nameLower = cat.name.toLowerCase();
    
    if (nameLower === 'jersey') icon = 'sports_soccer';
    else if (nameLower === 'clothing') icon = 'checkroom';
    else if (nameLower === 'accessories') icon = 'shopping_bag';
    
    return {
      id: cat.id,
      name: cat.name,
      icon
    };
  });

  return sendSuccess(res, 200, 'Categories fetched successfully.', formatted);
});
