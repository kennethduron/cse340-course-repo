import { getCategoriesByProjectId } from '../models/categories.js';
import { body, validationResult } from 'express-validator';
import { getAllOrganizations } from '../models/organizations.js';
import {
    createProject,
    getProjectDetails,
    getUpcomingProjects,
    updateProject
} from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
    body('title').trim().notEmpty().withMessage('Title is required.').isLength({ min: 3, max: 200 }).withMessage('Title must be 3 to 200 characters.'),
    body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 1000 }).withMessage('Description must be 1000 characters or fewer.'),
    body('location').trim().notEmpty().withMessage('Location is required.').isLength({ max: 200 }).withMessage('Location must be 200 characters or fewer.'),
    body('date').notEmpty().withMessage('Date is required.').isISO8601().withMessage('A valid date is required.'),
    body('organizationId').notEmpty().withMessage('Organization is required.').isInt({ min: 1 }).withMessage('A valid organization is required.')
];

const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = Number(req.params.id);
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesByProjectId(projectId);
        res.render('project', {
            title: project.title,
            project,
            categories
        });
    } catch (error) {
        next(error);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('new-project', { title: 'Add New Service Project', organizations });
    } catch (error) {
        next(error);
    }
};

const processNewProjectForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/new-project');
    }
    try {
        const { title, description, location, date, organizationId } = req.body;
        const projectId = await createProject(title, description, location, date, organizationId);
        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const project = await getProjectDetails(Number(req.params.id));
        if (!project) {
            const error = new Error('Project not found');
            error.status = 404;
            return next(error);
        }
        const organizations = await getAllOrganizations();
        const projectDate = new Date(project.date).toISOString().slice(0, 10);
        res.render('edit-project', {
            title: `Edit ${project.title}`,
            project,
            organizations,
            projectDate
        });
    } catch (error) {
        next(error);
    }
};

const processEditProjectForm = async (req, res, next) => {
    const projectId = Number(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect(`/edit-project/${projectId}`);
    }
    try {
        const { title, description, location, date, organizationId } = req.body;
        await updateProject(projectId, title, description, location, date, organizationId);
        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        if (error.status === 404) return next(error);
        req.flash('error', 'There was an error updating the service project.');
        res.redirect(`/edit-project/${projectId}`);
    }
};

export {
    NUMBER_OF_UPCOMING_PROJECTS,
    projectValidation,
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
};
