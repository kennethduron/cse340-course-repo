import {
    getAllCategories,
    getCategoriesByProjectId,
    getCategoryDetails,
    getProjectsByCategoryId,
    updateCategoryAssignments
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

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

export { showCategoriesPage, showCategoryDetailsPage, showAssignCategoriesForm, processAssignCategoriesForm };
