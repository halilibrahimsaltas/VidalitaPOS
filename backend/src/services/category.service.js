import { categoryRepository } from '../repositories/category.repository.js';
import { ApiError } from '../utils/ApiError.js';

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const categoryService = {
  getAllCategories: async (filters = {}) => {
    return categoryRepository.findAll(filters);
  },

  getCategoryById: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  },

  getRootCategories: async () => {
    return categoryRepository.findRootCategories();
  },

  createCategory: async (categoryData) => {
    const { name, parentId } = categoryData;

    // Generate slug from name
    let slug = generateSlug(name);
    let baseSlug = slug;

    // Ensure slug is unique
    let counter = 1;
    while (await categoryRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Validate parent if provided
    if (parentId) {
      const parent = await categoryRepository.findById(parentId);
      if (!parent) {
        throw new ApiError(400, 'Parent category not found');
      }
    }

    return categoryRepository.create({
      ...categoryData,
      slug,
    });
  },

  updateCategory: async (id, categoryData) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // If name is being updated, regenerate slug
    if (categoryData.name && categoryData.name !== category.name) {
      let slug = generateSlug(categoryData.name);
      let baseSlug = slug;

      // Ensure slug is unique (excluding current category)
      let counter = 1;
      while (true) {
        const existing = await categoryRepository.findBySlug(slug);
        if (!existing || existing.id === id) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      categoryData.slug = slug;
    }

    // Validate parent if being updated
    if (categoryData.parentId !== undefined) {
      if (categoryData.parentId === id) {
        throw new ApiError(400, 'Category cannot be its own parent');
      }

      if (categoryData.parentId) {
        const parent = await categoryRepository.findById(categoryData.parentId);
        if (!parent) {
          throw new ApiError(400, 'Parent category not found');
        }
      }
    }

    return categoryRepository.update(id, categoryData);
  },

  deleteCategory: async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new ApiError(400, 'Cannot delete category with subcategories');
    }

    // Check if category has products
    const productCount = category._count?.products || 0;
    if (productCount > 0) {
      throw new ApiError(400, 'Cannot delete category with associated products');
    }

    return categoryRepository.delete(id);
  },
};

export default categoryService;

