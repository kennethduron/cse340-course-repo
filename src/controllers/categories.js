import {
    createCategory,
    getAllCategories,
    getCategoriesByProjectId,
    getCategoryDetails,
    getProjectsByCategoryId,
    updateCategoryAssignments,
    updateCategory
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be 3 to 100 characters.')
];

const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Project Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = Number(req.params.id);
        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategoryId(categoryId);
        res.render('category', {
            title: category.name,
            category,
            projects
        });
    } catch (error) {
        next(error);
    }
};

const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = Number(req.params.projectId);
        const project = await getProjectDetails(projectId);
        if (!project) {
            const error = new Error('Project not found');
            error.status = 404;
            return next(error);
        }
        const [categories, assignedCategories] = await Promise.all([
            getAllCategories(),
            getCategoriesByProjectId(projectId)
        ]);
        res.render('assign-categories', { title: `Assign Categories: ${project.title}`, project, categories, assignedCategories });
    } catch (error) {
        next(error);
    }
};

const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = Number(req.params.projectId);
        const categoryIds = req.body.categoryIds
            ? (Array.isArray(req.body.categoryIds) ? req.body.categoryIds : [req.body.categoryIds])
            : [];
        await updateCategoryAssignments(projectId, categoryIds);
        req.flash('success', 'Project categories updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

const showNewCategoryForm = (req, res) => {
    res.render('new-category', { title: 'Add New Category' });
};

const processNewCategoryForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/new-category');
    }
    try {
        const categoryId = await createCategory(req.body.name);
        req.flash('success', 'Category added successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

const showEditCategoryForm = async (req, res, next) => {
    try {
        const category = await getCategoryDetails(Number(req.params.id));
        if (!category) {
            const error = new Error('Category not found');
            error.status = 404;
            return next(error);
        }
        res.render('edit-category', { title: `Edit ${category.name}`, category });
    } catch (error) {
        next(error);
    }
};

const processEditCategoryForm = async (req, res, next) => {
    const categoryId = Number(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect(`/edit-category/${categoryId}`);
    }
    try {
        await updateCategory(categoryId, req.body.name);
        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        if (error.status === 404) return next(error);
        next(error);
    }
};

export {
    categoryValidation,
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
};
